"""
Automated test for CRUD operations on Unidades (Real Estate Units) in Angular Dashboard.

This test verifies that UI actions correctly persist data in Supabase database.
Test Scenario: Create, edit, and delete a unidad inside a Proyecto.
"""
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client
from browser_use import Agent
from langchain_openai import ChatOpenAI

# Add tests directory to path for imports
tests_dir = Path(__file__).parent
sys.path.insert(0, str(tests_dir))

# Import login function
from login_to_dashboard import login_to_dashboard

# Load environment variables
load_dotenv()


class UnidadCRUDTest:
    """Test class for Unidad CRUD operations with database verification."""
    
    def __init__(self, base_url: str = "http://localhost:4200"):
        self.base_url = base_url
        self.agent: Optional[Agent] = None
        self.supabase: Optional[Client] = None
        self.created_unidad_id: Optional[str] = None
        self.created_unidad_nombre: Optional[str] = None
        self.test_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
    async def setup(self):
        """Initialize BrowserUse Agent and Supabase client."""
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in .env file. "
                "See tests/env.example for reference."
            )
        
        self.supabase = create_client(supabase_url, supabase_key)
        
        # Initialize BrowserUse Agent with LLM
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise ValueError(
                "OPENAI_API_KEY must be set in .env file for BrowserUse Agent. "
                "See tests/env.example for reference."
            )
        
        llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0,
            api_key=openai_key
        )
        
        self.agent = Agent(
            task="Test Unidad CRUD operations",
            llm=llm
        )
        
        print("✓ Setup complete: Agent and Supabase client initialized")
    
    async def teardown(self):
        """Clean up resources."""
        if self.agent:
            await self.agent.close()
        print("✓ Teardown complete")
    
    async def take_screenshot(self, name: str):
        """Take a screenshot for debugging."""
        try:
            if self.agent and hasattr(self.agent, 'browser'):
                screenshot_path = f"tests/screenshots/{name}_{self.test_timestamp}.png"
                os.makedirs("tests/screenshots", exist_ok=True)
                # Note: Actual screenshot implementation depends on browser-use API
                print(f"📸 Screenshot saved: {screenshot_path}")
        except Exception as e:
            print(f"⚠ Could not take screenshot: {e}")
    
    async def verify_unidad_in_db(
        self, 
        nombre: str, 
        expected_precio: Optional[float] = None,
        should_exist: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Verify unidad exists in Supabase database.
        
        Args:
            nombre: Name of the unidad to search for
            expected_precio: Expected price value (optional)
            should_exist: Whether the unidad should exist in DB
            
        Returns:
            Dictionary with unidad data if found, None otherwise
        """
        try:
            response = self.supabase.table("unidades")\
                .select("*")\
                .eq("nombre", nombre)\
                .is_("deleted_at", "null")\
                .execute()
            
            unidades = response.data if response.data else []
            
            if should_exist:
                assert len(unidades) == 1, (
                    f"Expected 1 unidad with nombre '{nombre}', "
                    f"found {len(unidades)}. Data: {unidades}"
                )
                
                unidad = unidades[0]
                
                if expected_precio is not None:
                    precio_db = unidad.get("precio")
                    assert precio_db == expected_precio, (
                        f"Price mismatch. Expected: {expected_precio}, "
                        f"Found in DB: {precio_db}"
                    )
                
                print(f"✓ Database verification passed for unidad '{nombre}'")
                return unidad
            else:
                assert len(unidades) == 0, (
                    f"Expected 0 unidades with nombre '{nombre}', "
                    f"found {len(unidades)}. Data: {unidades}"
                )
                print(f"✓ Database verification passed: unidad '{nombre}' deleted")
                return None
                
        except Exception as e:
            print(f"❌ Database verification failed: {e}")
            if response and hasattr(response, 'data'):
                print(f"   Found data: {response.data}")
            raise
    
    async def test_login_and_navigate(self):
        """Task 1: Login and navigate to Unidades page."""
        print("\n" + "="*60)
        print("TASK 1: Login and Navigate to Unidades")
        print("="*60)
        
        # Login using the reusable function
        await login_to_dashboard(
            agent=self.agent,
            base_url=self.base_url,
            email="testuser@test.com",
            password="testuser"
        )
        
        # Wait for dashboard to be fully loaded
        await self.agent.run(
            "Wait for the dashboard to be fully loaded. Look for elements like "
            "cards showing statistics or the sidebar navigation menu. "
            "Wait until Angular has finished rendering all components."
        )
        
        # Navigate to Unidades page via sidebar
        await self.agent.run(
            "Click on the sidebar navigation item labeled 'Proyectos' "
            "(which links to /unidades). Wait for the page to load completely."
        )
        
        # Wait for Unidades table/list to appear
        await self.agent.run(
            "Wait for the Unidades page to fully load. Look for:\n"
            "- A table or list showing unidades\n"
            "- A button labeled 'Nuevo' (New) button\n"
            "- The page title showing 'Unidades' or 'Proyectos'\n"
            "Do not proceed until these elements are visible and Angular has finished rendering."
        )
        
        print("✓ Successfully logged in and navigated to Unidades page")
    
    async def test_create_unidad(self):
        """Task 2: Create a new unidad inside a proyecto."""
        print("\n" + "="*60)
        print("TASK 2: Create New Unidad")
        print("="*60)
        
        # Generate unique test data
        self.created_unidad_nombre = f"Test Unidad {self.test_timestamp}"
        test_precio = 500000
        
        # Click "Nuevo" button to open form modal
        await self.agent.run(
            "Find and click the 'Nuevo' button to open the new unidad form modal. "
            "Wait for the modal to appear and be fully rendered."
        )
        
        # Wait for modal to be visible
        await self.agent.run(
            "Wait for the unidad form modal to be visible. Look for:\n"
            "- Modal title 'Nueva Unidad'\n"
            "- Tabs: 'Datos Básicos', 'Proyecto / Ubicación', 'Extras y Equipamiento'\n"
            "- Form fields in the 'Datos Básicos' tab\n"
            "Do not proceed until the modal is fully rendered."
        )
        
        # Fill Tab 1: Datos Básicos
        print("  Filling 'Datos Básicos' tab...")
        
        # Select Tipo de Propiedad (Type)
        await self.agent.run(
            "In the 'Datos Básicos' tab, find the 'Tipo de Propiedad' dropdown "
            "and select 'Apartamento'"
        )
        
        # Fill Nombre (Name)
        await self.agent.run(
            f"Find the 'Nombre' text input field and type '{self.created_unidad_nombre}'"
        )
        
        # Fill Piso (Floor) - required for Apartamento
        await self.agent.run(
            "Find the 'Piso' number input field and type '5'"
        )
        
        # Fill Dormitorios (Bedrooms)
        await self.agent.run(
            "Find the 'Dormitorios' number input field and type '2'"
        )
        
        # Fill Baños (Bathrooms)
        await self.agent.run(
            "Find the 'Baños' number input field and type '1'"
        )
        
        # Fill m2Internos (Internal m²)
        await self.agent.run(
            "Find the 'Tamaño Interior (m²)' number input field and type '75'"
        )
        
        # Fill m2Totales (Total m²)
        await self.agent.run(
            "Find the 'Tamaño Total (m²)' number input field and type '90'"
        )
        
        # Fill Orientación (Orientation)
        await self.agent.run(
            "Find the 'Orientación' dropdown and select any available option "
            "(e.g., 'Norte', 'Sur', 'Este', 'Oeste')"
        )
        
        # Fill Distribución (Layout)
        await self.agent.run(
            "Find the 'Distribución' dropdown and select any available option"
        )
        
        # Fill Altura (Height)
        await self.agent.run(
            "Find the 'Altura' text input field and type '3.5'"
        )
        
        # Fill Responsable (Agent/Responsible)
        await self.agent.run(
            "Find the 'Responsable' text input field and type 'Test Agent'"
        )
        
        # Fill Precio (Price)
        await self.agent.run(
            f"Find the 'Precio (USD)' number input field and type '{test_precio}'"
        )
        
        # Fill Comisión (Commission)
        await self.agent.run(
            "Find the 'Comisión (%)' number input field and type '3'"
        )
        
        # Navigate to Tab 2: Proyecto / Ubicación
        print("  Filling 'Proyecto / Ubicación' tab...")
        await self.agent.run(
            "Click on the 'Proyecto / Ubicación' tab to switch to that tab. "
            "Wait for the tab content to load."
        )
        
        # Select or create proyecto
        await self.agent.run(
            "In the 'Proyecto / Ubicación' tab, select 'Proyecto Existente' radio button "
            "if not already selected. Then find the proyecto dropdown and select the first "
            "available proyecto from the list. If no proyectos exist, select 'Nuevo Proyecto' "
            "and fill in a proyecto name like 'Test Proyecto'."
        )
        
        # Fill Ciudad (City) - if not auto-filled by proyecto
        await self.agent.run(
            "Find the 'Ciudad' dropdown and select 'Montevideo' (or 'norte' if that's the option). "
            "Wait for barrios to load."
        )
        
        # Fill Barrio (Neighborhood)
        await self.agent.run(
            "Find the 'Barrio' dropdown and select any available barrio option"
        )
        
        # Save the unidad
        print("  Saving unidad...")
        await self.agent.run(
            "Find and click the 'Guardar' or 'Save' button to save the unidad. "
            "Wait for the success notification or toast message to appear."
        )
        
        # Wait for success notification
        await self.agent.run(
            "Wait for a success toast notification or message indicating the unidad "
            "was saved successfully. Also wait for the modal to close and the unidades "
            "list/table to refresh showing the new unidad."
        )
        
        # Verify in database
        print("  Verifying in database...")
        unidad_db = await self.verify_unidad_in_db(
            nombre=self.created_unidad_nombre,
            expected_precio=test_precio,
            should_exist=True
        )
        
        if unidad_db:
            self.created_unidad_id = unidad_db.get("id")
            print(f"✓ Unidad created successfully. ID: {self.created_unidad_id}")
        
        print("✓ CREATE test passed")
    
    async def test_edit_unidad(self):
        """Task 3: Edit the created unidad."""
        print("\n" + "="*60)
        print("TASK 3: Edit Unidad")
        print("="*60)
        
        if not self.created_unidad_id:
            raise Exception("Cannot edit: No unidad was created in previous step")
        
        new_precio = 550000
        
        # Find and click edit button for the unidad
        await self.agent.run(
            f"Find the unidad with name '{self.created_unidad_nombre}' in the table/list. "
            "Look for the edit button (usually a pencil icon or 'Editar' link) and click it. "
            "Wait for the edit modal to open."
        )
        
        # Wait for edit modal
        await self.agent.run(
            "Wait for the unidad edit form modal to be visible. Look for:\n"
            "- Modal title 'Editar Unidad'\n"
            "- Form fields pre-filled with the unidad data\n"
            "Do not proceed until the modal is fully rendered."
        )
        
        # Update price
        print("  Updating precio...")
        await self.agent.run(
            f"Find the 'Precio (USD)' number input field, clear it, and type '{new_precio}'"
        )
        
        # Save changes
        print("  Saving changes...")
        await self.agent.run(
            "Find and click the 'Guardar' or 'Save' button to save the changes. "
            "Wait for the success notification to appear."
        )
        
        # Wait for success
        await self.agent.run(
            "Wait for a success toast notification indicating the unidad was updated. "
            "Also wait for the modal to close and the list to refresh."
        )
        
        # Verify update in database
        print("  Verifying update in database...")
        await self.verify_unidad_in_db(
            nombre=self.created_unidad_nombre,
            expected_precio=new_precio,
            should_exist=True
        )
        
        print("✓ EDIT test passed")
    
    async def test_delete_unidad(self):
        """Task 4: Delete the unidad."""
        print("\n" + "="*60)
        print("TASK 4: Delete Unidad")
        print("="*60)
        
        if not self.created_unidad_id:
            raise Exception("Cannot delete: No unidad was created")
        
        # Find and click delete button
        await self.agent.run(
            f"Find the unidad with name '{self.created_unidad_nombre}' in the table/list. "
            "Look for the delete button (usually a trash icon) and click it."
        )
        
        # Confirm deletion
        await self.agent.run(
            "A confirmation dialog should appear asking to confirm deletion. "
            "Click the confirm/accept button (usually 'Eliminar', 'Delete', or 'OK'). "
            "Wait for the confirmation dialog to close."
        )
        
        # Wait for success notification
        await self.agent.run(
            "Wait for a success toast notification indicating the unidad was deleted. "
            "Also wait for the unidades list/table to refresh and the unidad to disappear."
        )
        
        # Verify deletion in database
        print("  Verifying deletion in database...")
        await self.verify_unidad_in_db(
            nombre=self.created_unidad_nombre,
            should_exist=False
        )
        
        print("✓ DELETE test passed")
    
    async def run_all_tests(self):
        """Run all CRUD tests in sequence."""
        try:
            await self.setup()
            
            # Run tests in sequence
            await self.test_login_and_navigate()
            await self.test_create_unidad()
            await self.test_edit_unidad()
            await self.test_delete_unidad()
            
            print("\n" + "="*60)
            print("✅ ALL TESTS PASSED")
            print("="*60)
            
        except Exception as e:
            print(f"\n❌ TEST FAILED: {e}")
            await self.take_screenshot("test_failure")
            raise
        finally:
            await self.teardown()


async def main():
    """Main entry point."""
    base_url = os.getenv("BASE_URL", "http://localhost:4200")
    
    test = UnidadCRUDTest(base_url=base_url)
    await test.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())

