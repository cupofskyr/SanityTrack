/**
 * @jest-environment node
 */
const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const { onUserCreate, adjustBalance, changeCardStatus } = require('../index');

// Mock Firestore
jest.mock('firebase-admin', () => {
    const firestore = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        add: jest.fn(),
        batch: jest.fn(() => ({
            set: jest.fn(),
            commit: jest.fn().mockResolvedValue(true),
        })),
        FieldValue: {
            serverTimestamp: jest.fn(),
        },
    };
    return {
        initializeApp: jest.fn(),
        firestore: () => firestore,
    };
});

describe('Cloud Functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('onUserCreate', () => {
        it('should create user and employee documents for a new user', async () => {
            const user = {
                uid: 'testUid123',
                email: 'test@example.com',
                displayName: 'Test User',
            };

            const wrapped = test.wrap(onUserCreate);
            await wrapped(user);

            const db = admin.firestore();
            expect(db.batch().set).toHaveBeenCalledTimes(2);
            expect(db.collection).toHaveBeenCalledWith('users');
            expect(db.collection).toHaveBeenCalledWith('employees');
            expect(db.doc).toHaveBeenCalledWith('testUid123');
            expect(db.batch().commit).toHaveBeenCalled();
        });
    });

    describe('adjustBalance', () => {
        it('should deny access if user is not authenticated', async () => {
            const wrapped = test.wrap(adjustBalance);
            await expect(wrapped({}, {})).rejects.toThrow('User not authenticated.');
        });

        it('should deny access for employee role', async () => {
            admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ role: 'employee' }) });
            const wrapped = test.wrap(adjustBalance);
            const context = { auth: { uid: 'employeeUid' } };
            await expect(wrapped({}, context)).rejects.toThrow('Insufficient permissions.');
        });

        it('should allow owner to adjust balance', async () => {
            // Mock admin check
            admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ role: 'owner' }) });
            // Mock employee doc
            admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ membershipCard: { creditBalance: 100 } }) });

            const wrapped = test.wrap(adjustBalance);
            const data = { employeeId: 'targetUid', amount: 50, reason: 'test' };
            const context = { auth: { uid: 'ownerUid' } };

            await wrapped(data, context);
            expect(admin.firestore().update).toHaveBeenCalledWith({ 'membershipCard.creditBalance': 150, 'membershipCard.lastUpdated': expect.any(Function) });
            expect(admin.firestore().add).toHaveBeenCalled();
        });

         it('should deny manager from adjusting balance of employee in different location', async () => {
            // Mock admin check
            admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ role: 'manager', locationId: 'loc-A' }) });
            // Mock employee doc
            admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ locationId: 'loc-B' }) });

            const wrapped = test.wrap(adjustBalance);
            const data = { employeeId: 'targetUid', amount: 50, reason: 'test' };
            const context = { auth: { uid: 'managerUid' } };

            await expect(wrapped(data, context)).rejects.toThrow('Managers can only act within their location.');
        });
    });
});
