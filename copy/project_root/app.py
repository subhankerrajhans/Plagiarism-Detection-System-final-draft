from firebase_admin import credentials
import firebase_admin

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)


# DONT SHARE THIS FILE ON GITHUB
