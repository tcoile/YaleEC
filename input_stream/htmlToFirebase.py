# Because YaleConnect allows you to see all the information on the screen, we should be able to extract it relatively easily...

# each club is listed with class=listing-element__title-block
# Club Name: h4 -> a -> club name 
# 
from bs4 import BeautifulSoup
import firebase_admin
import google.cloud
from firebase_admin import credentials, firestore

cred = credentials.Certificate("./serviceAccountKey.json")
app = firebase_admin.initialize_app(cred)

store = firestore.client()

doc_ref = store.collection('organizations')
# doc_ref.add({'name': 'test', 'added': 'just now'})


with open('clubs.html', 'r') as file:
    contents = file.read()
    soup = BeautifulSoup(contents, 'html.parser')
    organizations = soup.find_all("div", class_="listing-element__title-block")
    organizations = organizations[1:len(organizations)]
    documents = []    
    for org in organizations: 
        orgname = org.h4.a.string.strip() #organization

        tags = org.p.string.strip().split('-')
        if len(tags) == 1:
            tags = ""
        else: 
            tags = tags[1]
        tags = tags.split(',')
        newtags = []
        for tag in tags:
            newtags += tag.split(':')
        for tag in newtags:
            tag.strip()
        # now newtag is an array of all our tags

        rest = org.find("div", class_="info_hidden_xxs")
        website = rest.find("a").get('href') # website link
        
        mission = rest.find_all("p")[1]
        if(len(mission.find_all('strong')) == 1):
            mission = mission.contents[3].strip() # mission
        else:
            mission = ""

        doc_ref.add({'name': orgname, 'tags': newtags, 'website': website, 'mission': mission})