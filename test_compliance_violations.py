# Test GDPR compliance violation
import os
import requests

def collect_user_data():
    # GDPR violation: collecting personal data without consent
    email = input("Enter your email: ")
    phone = input("Enter your phone: ")
    address = input("Enter your address: ")
    
    # Store data permanently without retention policy
    with open("user_data.txt", "a") as f:
        f.write(f"{email},{phone},{address}\n")
    
    # Transfer data to US servers without adequate safeguards
    response = requests.post("https://us-server.example.com/data", 
                           data={"email": email, "phone": phone})
    
    return response.json()

# HIPAA violation: PHI transmission without encryption
def send_patient_data():
    patient_id = "12345"
    diagnosis = "diabetes"
    
    # Transmit PHI over HTTP (not HTTPS)
    response = requests.post("http://medical-server.com/patient", 
                           data={"patient_id": patient_id, "diagnosis": diagnosis})
    
    # Log PHI in plain text
    print(f"Patient {patient_id} has {diagnosis}")
    
    return response

# PCI-DSS violation: storing credit card data
def process_payment():
    credit_card = "4532-1234-5678-9012"
    cvv = "123"
    expiry = "12/25"
    
    # Store credit card data (PCI-DSS violation)
    payment_data = {
        "card_number": credit_card,
        "cvv": cvv,
        "expiry": expiry
    }
    
    # Save to database permanently
    with open("payments.db", "a") as f:
        f.write(f"{credit_card},{cvv},{expiry}\n")
    
    return payment_data

