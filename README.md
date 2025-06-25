npm install
npm run build
cp -r .next functions/.next
firebase deploy
# SanityTrack
git add .
git commit -m "Fix: Resolve build issue with charting library"
git push origin main

