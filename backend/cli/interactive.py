'''
Command-line interface for the Car Rental Management System.
'''

from .services.vehicles import list_available_vehicles,list_all_vehicles
from .services.customers import register_customer,list_customers
from .services.rentals import rent_vehicle, return_vehicle
from .services.analytics import view_branch_stats, view_customer_history

def main():
    """
    CLI Improvements:
    - Strips whitespace from user input
    - Handles KeyboardInterrupt / EOFError for clean exit
    - Maps options 1-8 to corresponding functions
    - Silently ignores common accidental shell commands
    """
    try:
        while True:
            print("\n=== Car Rental CLI ===")
            print("1. List Available Vehicles")
            print("2. List All Vehicles")
            print("3. List All Customers")
            print("4. Register New Customer")
            print("5. Rent a Vehicle")
            print("6. Return a Vehicle")
            print("7. View Branch Stats")
            print("8. View Customer History")
            print("9. Exit")

            try:
                choice = input("Select an option: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nExiting CLI.")
                break

            if choice == "1":
                list_available_vehicles()
            elif choice == "2":
                list_all_vehicles()
            elif choice == "3":
                list_customers()
            elif choice == "4":
                register_customer()
            elif choice == "5":
                rent_vehicle()
            elif choice == "6":
                return_vehicle()
            elif choice == "7":
                view_branch_stats()
            elif choice == "8":
                view_customer_history()
            elif choice == "9":
                print("Exiting CLI. Goodbye!")
                break
            else:
                # Silently ignore accidental shell commands like `source` or `.`
                if choice.startswith("source ") or choice.startswith("."):
                    continue
                print("Invalid option. Try again.")

    except Exception as e:
        # Catch any unexpected exceptions to prevent CLI crash
        print(f"Unexpected error in CLI: {e}")

if __name__ == "__main__":
    main()
