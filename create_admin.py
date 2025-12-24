#!/usr/bin/env python3
"""
Quick script to create admin user via the API.
Run this after deploying to create the initial admin account.
"""

import requests
import sys

def create_admin_user(api_url):
    """Create admin user using the register endpoint"""
    
    url = f"{api_url}/auth/register"
    
    params = {
        "username": "admin",
        "password": "admin123",
        "email": "admin@carrentalsystem.com",
        "full_name": "System Administrator"
    }
    
    print(f"Creating admin user at {url}...")
    
    try:
        response = requests.post(url, params=params, timeout=30)
        
        if response.status_code == 200:
            print("✓ Admin user created successfully!")
            print(f"  Username: admin")
            print(f"  Password: admin123")
            print(f"  Email: admin@carrentalsystem.com")
            return True
        elif response.status_code == 400 and "already registered" in response.text:
            print("⚠ Admin user already exists")
            return True
        else:
            print(f"✗ Failed to create admin user")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error connecting to API: {e}")
        return False

if __name__ == "__main__":
    # Use provided API URL or default to production
    api_url = sys.argv[1] if len(sys.argv) > 1 else "https://car-rental-management-system-51nu.onrender.com/api"
    
    print("=" * 60)
    print("Car Rental System - Admin User Setup")
    print("=" * 60)
    print(f"API URL: {api_url}")
    print()
    
    success = create_admin_user(api_url)
    
    print()
    print("=" * 60)
    
    sys.exit(0 if success else 1)
