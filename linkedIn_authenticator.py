import time
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LinkedInAuthenticator:
    
    def __init__(self, driver=None):
        self.driver = driver
        self.email = ""
        self.password = ""

    def set_secrets(self, email, password):
        self.email = email
        self.password = password

    def start(self):
        """Start the Chrome browser and attempt to log in to LinkedIn."""
        print("Starting Chrome browser to log in to LinkedIn.")
        self.driver.get('https://www.linkedin.com')
        self.wait_for_page_load()
        if not self.is_logged_in():
            self.handle_login()

    def handle_login(self):
        """Handle the LinkedIn login process."""
        print("Navigating to the LinkedIn login page...")
        self.driver.get("https://www.linkedin.com/login")
        try:
            self.enter_credentials()
            self.submit_login_form()
        except NoSuchElementException:
            print("Could not log in to LinkedIn. Please check your credentials.")
        time.sleep(3) #TODO fix better
        self.handle_security_check()

    def enter_credentials(self):
        """Enter the user's email and password into the login form."""
        try:
            email_field = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            email_field.send_keys(self.email)
            password_field = self.driver.find_element(By.ID, "password")
            password_field.send_keys(self.password)
        except TimeoutException:
            print("Login form not found. Aborting login.")

    def submit_login_form(self):
        """Submit the LinkedIn login form."""
        try:
            login_button = self.driver.find_element(By.XPATH, '//button[@type="submit"]')
            login_button.click()
        except NoSuchElementException:
            print("Login button not found. Please verify the page structure.")

    def handle_security_check(self):
        """Handle LinkedIn security checks if triggered."""
        try:
            WebDriverWait(self.driver, 2).until(
                EC.url_contains('https://www.linkedin.com/checkpoint/challengesV2/')
            )
            print("Security checkpoint detected. Please complete the challenge.")
            WebDriverWait(self.driver, 2).until(
                EC.url_contains('https://www.linkedin.com/feed/')
            )
            print("Security check completed")
        except TimeoutException:
            print("Security check not completed. Please try again later.")

    def is_logged_in(self):
        """Check if the user is already logged in to LinkedIn."""
        self.driver.get('https://www.linkedin.com/feed')
        try:
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.share-box-feed-entry__top-bar'))
            )
            buttons = self.driver.find_elements(By.CSS_SELECTOR, '.share-box-feed-entry__top-bar')
            if any(button.text.strip() == 'Start a post' for button in buttons):
                print("User is already logged in.")
                return True
        except TimeoutException:
            pass
        return False

    def wait_for_page_load(self, timeout=2):
        """Wait for the page to fully load."""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
        except TimeoutException:
            print("Page load timed out.")
