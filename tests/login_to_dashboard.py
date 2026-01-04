"""
Reusable async function for logging into the Angular dashboard using browser-use.
"""
import asyncio
from browser_use import Agent


async def login_to_dashboard(
    agent: Agent,
    base_url: str = "http://localhost:4200",
    email: str = "testuser@test.com",
    password: str = "testuser",
    login_path: str = "/login"
) -> None:
    """
    Logs into the Angular dashboard using browser-use Agent.
    
    This function handles the complete login flow:
    1. Navigates to the login page
    2. Fills in email and password fields
    3. Clicks the login button
    4. Waits for Angular navigation to complete and dashboard to render
    
    Args:
        agent: The browser-use Agent instance
        base_url: Base URL of the application (default: http://localhost:4200)
        email: Email for login (default: testuser@test.com)
        password: Password for login (default: testuser)
        login_path: Path to login page (default: /login)
    
    Raises:
        Exception: If login fails or dashboard doesn't load
    """
    login_url = f"{base_url}{login_path}"
    
    # Step 1: Navigate to login page
    await agent.run(f"Navigate to {login_url}")
    
    # Step 2: Wait for login form to be visible and fill email
    await agent.run(
        f"Find the email input field (look for input[type='email'] or input[formControlName='email'] "
        f"or input with placeholder containing 'Email') and type '{email}' into it"
    )
    
    # Step 3: Fill password field
    await agent.run(
        f"Find the password input field (look for input[type='password'] or input[formControlName='password'] "
        f"or input with placeholder containing 'Password') and type '{password}' into it"
    )
    
    # Step 4: Click the login button
    await agent.run(
        "Find and click the login button. Look for button[type='submit'] or a button with text 'Entrar', "
        "'Login', or 'Sign In'"
    )
    
    # Step 5: Critical Angular handling - Wait for navigation and dashboard to render
    dashboard_url = f"{base_url}/dashboard"
    
    await agent.run(
        f"Wait until the dashboard page has fully loaded. This means:\n"
        f"- The URL has changed to '{dashboard_url}' or contains '/dashboard', AND\n"
        f"- At least one of these dashboard elements is visible:\n"
        f"  * An element with class 'app-sidebar' (the sidebar navigation)\n"
        f"  * An element containing the text 'GestorApp' (sidebar title)\n"
        f"  * An element with class 'cards-container-4' (dashboard cards)\n"
        f"  * An element with class 'app-content' (main content area)\n"
        f"Do not proceed until the dashboard is fully rendered. Angular apps need time to complete "
        f"navigation and render components."
    )
    
    # Step 6: Final verification
    await agent.run(
        "Verify the dashboard loaded successfully by confirming you can see dashboard content "
        "like cards showing statistics or a sidebar navigation menu"
    )


# Example usage:
async def example_usage():
    """
    Example of how to use the login_to_dashboard function.
    """
    from browser_use import Agent
    
    # Initialize agent
    agent = Agent(
        task="Login to dashboard",
        llm=None  # You'll need to provide your LLM instance
    )
    
    try:
        await login_to_dashboard(agent)
        print("Successfully logged in to dashboard!")
    except Exception as e:
        print(f"Login failed: {e}")
    finally:
        await agent.close()


if __name__ == "__main__":
    # Run example
    asyncio.run(example_usage())

