# Automated Testing for Angular Real Estate Dashboard

This directory contains automated tests for the Angular Real Estate Dashboard using BrowserUse and Supabase verification.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/service key
- `BASE_URL`: Your Angular app URL (default: http://localhost:4200)
- `OPENAI_API_KEY`: Your OpenAI API key (for BrowserUse Agent)

### 3. Run Tests

```bash
# Run the complete CRUD test suite
python tests/test_unidad_crud.py

# Or run individual test functions programmatically
python -c "from tests.test_unidad_crud import UnidadCRUDTest; import asyncio; asyncio.run(UnidadCRUDTest().run_all_tests())"
```

## Test Structure

### `login_to_dashboard.py`
Reusable function for logging into the dashboard. Handles:
- Navigation to login page
- Form filling (email/password)
- Angular-specific waiting for navigation completion
- Dashboard verification

### `test_unidad_crud.py`
Complete CRUD test suite that:
1. **Login & Navigate**: Logs in and navigates to Unidades page
2. **Create**: Creates a new unidad inside a proyecto
3. **Edit**: Updates the unidad (e.g., changes price)
4. **Delete**: Deletes the unidad
5. **Database Verification**: After each operation, verifies data persistence in Supabase

## Test Flow

```
Login → Navigate to Unidades → Create Unidad → Verify DB
                                    ↓
                              Edit Unidad → Verify DB
                                    ↓
                              Delete Unidad → Verify DB
```

## Features

- **Angular-Aware**: Handles Angular SPA navigation and dynamic rendering
- **Database Verification**: Verifies UI actions persist correctly in Supabase
- **Error Handling**: Takes screenshots on failure, provides detailed error messages
- **Unique Test Data**: Uses timestamps to ensure unique test data
- **Comprehensive**: Tests complete CRUD workflow

## Troubleshooting

### "Element not found" errors
- Ensure Angular app is running and accessible at BASE_URL
- Check that the app has finished loading before interactions
- Increase wait times if needed

### Database verification failures
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check that the database schema matches expected structure
- Ensure RLS policies allow read/write operations

### Screenshots
Screenshots are saved to `tests/screenshots/` on test failures for debugging.

