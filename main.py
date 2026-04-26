import bcrypt
import getpass

# Ask user for password securely (hidden input)
password = getpass.getpass("Enter password: ")

# Convert to bytes
password_bytes = password.encode("utf-8")

# Generate salt and bcrypt hash
salt = bcrypt.gensalt(rounds=10)
hashed = bcrypt.hashpw(password_bytes, salt)

# Show result
print("\nBcrypt Hash:")
print(hashed.decode())