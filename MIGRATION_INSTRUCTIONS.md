# Database Migration Instructions

## Adding Postal Code Column to Spots Table

This migration adds a `postal_code` column to the `spots` table to fix the spot creation error.

### Steps to Apply Migration

1. Connect to your Supabase project:

```bash
npx supabase link --project-ref your-project-ref
```

2. Push the migration to your Supabase project:

```bash
npx supabase db push
```

3. Verify the migration was applied:

```bash
npx supabase db diff
```

4. After the migration is applied, uncomment the `postal_code` field in the `createSpotRecord` function in `src/screens/Spots/AddSpot/AddSpotScreen.tsx`:

```typescript
// Change this:
// postal_code field removed until migration is applied
// postal_code: formData.postalCode ?? null,

// To this:
postal_code: formData.postalCode ?? null,
```

### Alternative Manual Method

If you prefer to apply the migration manually:

1. Go to the Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
ALTER TABLE spots ADD COLUMN IF NOT EXISTS postal_code TEXT;
COMMENT ON COLUMN spots.postal_code IS 'The postal code of the spot location';
```

4. After applying the migration, uncomment the `postal_code` field in the code as described above.

## Troubleshooting

If you encounter any issues with the migration:

1. Check the Supabase logs for error messages
2. Verify that you have the necessary permissions to alter the table
3. Ensure that the `spots` table exists in your database
