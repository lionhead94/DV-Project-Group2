from bs4 import BeautifulSoup
from urllib import request
import pandas as pd
import pexpect
import sys
import os
import time
import shutil

data = pd.read_csv("./Datasets/percentageBySection.csv")
path = "/home/matteo/DV-Project/Images/"
f = open("./Datasets/logos.csv", "w+")
f.write("Brand,Link\n")
for brand in data["Brand"]:
	print(brand)
	if(brand == "Big Bazaar - ffb"):
		brand = "Big Bazaar"
	argument = brand.replace("&", "and").replace("'", "").replace("è", "e").replace("é", "e").replace("ä","a").split(" ")
	argument = '+'.join(argument)
	urlString = "https://duckduckgo.com/?t=ffab&q=" + argument + "+logo&iax=images&ia=images"
	command1 = "firefox " + urlString
	command2 = "xdotool key ctrl+s"
	command3 = "xdotool type " + path + argument
	command4 = "xdotool key KP_Enter"
	command5 = "xdotool key ctrl+w"
	child = pexpect.spawn(command1, encoding='utf-8')
	child.logfile_read = sys.stdout
	time.sleep(4)
	child2 = pexpect.spawn(command2, encoding='utf-8')
	time.sleep(1)
	child3 = pexpect.spawn(command3, encoding='utf-8')
	time.sleep(1)
	child4 = pexpect.spawn(command4, encoding='utf-8')
	time.sleep(8)
	child5 = pexpect.spawn(command5, encoding='utf-8')

	with open(path + argument + ".html") as fi:
		soup = BeautifulSoup(fi, 'html.parser')
	images = []
	for image in soup.find_all("img"):
		x = image.get('data-src')
		if x and "assets" not in str(x) and "ico" not in str(x):
			images.append("http:" + x)
	print(images[0])
	f.write(brand + "," + images[0]+"\n")
	shutil.rmtree(path + argument + "_files")
	for filename in os.listdir(path):
		if "html" in filename:
			os.remove(path + filename)
