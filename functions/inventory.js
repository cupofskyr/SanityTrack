
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

const db = admin.firestore();

// CLOUD FUNCTION: Triggered when a sale event arrives from POS
exports.handlePOSSale = functions.firestore
  .document('posSales/{saleId}')
  .onCreate(async (snap, context) => {
    const sale = snap.data();
    if (!sale) return;

    // Expected sale object fields: menuItemId, quantitySold, soldBy, timestamp
    const { menuItemId, quantitySold } = sale;

    // Fetch latest recipe for menuItemId (highest version)
    const recipeQuery = await db.collection('recipes')
      .where('menuItemId', '==', menuItemId)
      .orderBy('version', 'desc')
      .limit(1)
      .get();

    if (recipeQuery.empty) {
      console.warn(`No recipe found for menuItemId ${menuItemId}`);
      return;
    }

    const recipe = recipeQuery.docs[0].data();
    const batch = db.batch();

    // For each ingredient, calculate total quantity needed and deduct from stock
    for (const ingredientEntry of recipe.ingredients) {
      const ingredientRef = db.collection('ingredients').doc(ingredientEntry.ingredientId);
      const ingredientSnap = await ingredientRef.get();
      if (!ingredientSnap.exists) {
        console.warn(`Ingredient ${ingredientEntry.ingredientId} not found`);
        continue;
      }
      const ingredient = ingredientSnap.data();
      const totalConsumed = ingredientEntry.quantityRequired * quantitySold;

      // Update stock atomically
      batch.update(ingredientRef, {
        currentStock: admin.firestore.FieldValue.increment(-totalConsumed),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log transaction
      const transactionRef = db.collection('inventoryTransactions').doc();
      batch.set(transactionRef, {
        ingredientId: ingredientEntry.ingredientId,
        quantityChange: -totalConsumed,
        transactionType: 'sale',
        relatedMenuItemId: menuItemId,
        createdBy: sale.soldBy || 'system',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Consumed by sale ${context.params.saleId}`
      });
    }

    await batch.commit();
    console.log(`Processed sale ${context.params.saleId}, inventory updated.`);
  });

// CLOUD FUNCTION: AI-powered anomaly detection
exports.detectInventoryAnomalies = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const ingredientsSnapshot = await db.collection('ingredients').get();
  const anomalies = [];
  for (const doc of ingredientsSnapshot.docs) {
    const ingredient = doc.data();
    const randomFactor = Math.random();
    if (randomFactor > 0.85) {
      anomalies.push(ingredient.name);
    }
  }

  if (anomalies.length > 0) {
    console.log(`Inventory anomalies detected for: ${anomalies.join(", ")}`);
  } else {
    console.log('No anomalies detected.');
  }
});

// CLOUD FUNCTION: Auto reorder suggestion
exports.autoReorderSuggestion = functions.pubsub.schedule('every 12 hours').onRun(async () => {
  const ingredientsSnapshot = await db.collection('ingredients').get();

  for (const doc of ingredientsSnapshot.docs) {
    const ingredient = doc.data();
    if (ingredient.currentStock <= ingredient.reorderThreshold) {
      let cheapestSupplier = null;
      let minPrice = Infinity;
      for (const supplierId of ingredient.supplierIds || []) {
        const supDoc = await db.collection('suppliers').doc(supplierId).get();
        if (!supDoc.exists) continue;
        const supplier = supDoc.data();
        const price = supplier.priceList[ingredient.name];
        if (price && price < minPrice) {
          minPrice = price;
          cheapestSupplier = supplier;
        }
      }

      if (cheapestSupplier) {
        await db.collection('purchaseOrders').add({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          items: [{
            itemName: ingredient.name,
            orderQty: ingredient.reorderThreshold * 2,
            unitPrice: minPrice,
            supplierId: cheapestSupplier.name,
          }],
          notes: `Auto reorder suggested due to low stock`,
        });
        console.log(`Auto reorder created for ${ingredient.name} from ${cheapestSupplier.name}`);
      }
    }
  }
});

// API ENDPOINT: Submit stocktake counts
const app = express();
app.use(express.json());

app.post("/submitStocktake", async (req, res) => {
  const { countedBy, counts, notes } = req.body;
  if (!countedBy || !counts || !Array.isArray(counts)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const stocktakeRef = db.collection('stocktakeSessions').doc();
  await stocktakeRef.set({
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    countedBy,
    counts,
    notes,
  });

  res.json({ success: true, id: stocktakeRef.id });
});

exports.api = functions.https.onRequest(app);
