# Frontend full folders updated in last 2-3 days (2026-07-21 .. 2026-07-23)

This zip contains COMPLETE folders (not only changed files):

- app/components/Checkout/
- app/components/DataTable/NextPurchaseDiscountTable/
- app/components/SettingPage/
- app/constant/
- app/v1/dashboard/tax-settings/
- routes/api/
- types/

## Related commits
- 768eae0 Remove automatic SMS settings from admin UI
- 1da04d4 pattern SMS frontend + Checkout copy
- 908ebb6 SMS on/off switch for next-purchase settings
- b3773c0 deploy note zip

## Deploy
Unzip into Next.js project root, then:
yarn build
# or: npm run build
pm2 restart <frontend>   # if used
