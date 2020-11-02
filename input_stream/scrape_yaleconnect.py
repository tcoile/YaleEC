# IMPORTANT NOTE: this script only works when 2FA doesn't 
# have to exist aka only when you're on the Yale WiFi
import mechanicalsoup
import privateInfo

browser = mechanicalsoup.StatefulBrowser()
browser.open('https://yaleconnect.yale.edu/home_login')

# 1. click the sign in button https://yaleconnect.yale.edu/home_login
page = browser.get_current_page()
link = page.find(id='a-sign-in-button_1')
browser.follow_link(link)

# 2. click the 'login with ur cas info' button here https://yaleconnect.yale.edu/login_only?redirect=
browser.follow_link('shibboleth')

# 3. Enter ID and password
browser.select_form('#fm1')
browser['username'] = privateInfo.username
browser['password'] = privateInfo.password
response = browser.submit_selected()
print(browser.get_current_page())

# Submit intermediate forms to pass things along
browser.select_form('#duo_form')
browser.submit_selected()
print(browser.get_current_page())

# Get to undergraduate page
browser.follow_link('club_signup')
page = browser.get_current_page()

buttons = page.find_all('a', { "class" : "btn btn-default"})
for button in buttons:
    if button.text.find("Yale College Undergraduate Organizations") > -1: 
        element = button
browser.follow_link(element)

#now go to page with all clubs visible
page = browser.get_current_page()
element = page.find('a', { 'class' : 'btn btn-grey'})
print(element)
browser.follow_link(element)
print(browser.get_url())