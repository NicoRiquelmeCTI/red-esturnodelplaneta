import csv
import os
files = os.listdir("../files/following/") # returns list
names = {}
for profile in files:
    names[profile.split('following')[0][0:-1]] = profile

# función encontrada en codigo de medium"
""" def generate_txt(relations_file, my_followers_arr, username):
    relations = open(relations_file, 'w+')
    for key in my_followers_arr:
        line = key + " " + "https://www.instagram.com/" + username + "/\n" + "https://www.instagram.com/" + username + "/ " + key + "\n"
        relations.write(line) """

def load_following(relations, current_profile):
    
    print("### making relations for: {} \n \n".format(names[current_profile['username']]))
        
    with open("../files/following/{}".format(names[current_profile['username']]), newline='') as csvfile:
        
        current_followings = csv.DictReader(csvfile)
        
        for profile_following in current_followings:
            """ print('current profile: @{} \n'.format(current_profile['username']))
            print('profile who follow: @{} \n'.format(profile_following['username'])) """
            if profile_following['username'] in names.keys():
                line = current_profile['username'] + " " + profile_following['username'] + "\n"
                relations.write(line)

with open("../files/esturnodelplaneta_followers.csv", newline='') as csvfile:
    followers = csv.DictReader(csvfile)
    relations = open('relations_file.txt', 'w+')
    for current_follower in followers:
        if not(current_follower['\ufeff"pk"'] == 'idk.bvrb' or current_follower['is_private'] == 'true'):
            load_following(relations, current_follower)

        

