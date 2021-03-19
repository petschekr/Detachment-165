# Detachment 165
This is the git repository used for the official Detachment 165 page located at afrotc.gatech.edu. If you are new to working with websites and you have been voluntold to help out with this one, do not fear! For your friendly README is here!

## Table of Contents
- [Getting Started](#getting-started)
- [Deployment](#deployment)

## Getting Started
1) Clone the git repository 
`git clone https://github.com/petschekr/Detachment-165.git`
If you do not have git, you can download it [here](https://git-scm.com/downloads)

2) Make sure you have node and npm installed
You can download the latest stable (LTS) release of node and npm (node package manager) at https://nodejs.org/en/

3) Install required dependencies
Go to the rendered folder `cd Detachment-165/rendered/`
Install Dependencies using npm `npm install`

4) Install typescript
`npm install -g typescript`
Note: the -g tells npm to install typescript so it can be accessed globally

5) Compile typescript files
`tsc`
This command will compile all typescript files into javascript files. Basically, all files ending in .ts will have another file created with the same name but with the ending .js

6) Copy the .env.example file to a new file called .env
Windows: `copy .env.example .env`
Linux/Mac: `cp .env.example .env`

7) Run local server
`node app.js`

8) You should now be able to go to [localhost](https://localhost:3000) on port 3000 and view the website. If you make any changes in the repository files, they should be reflected here.

## Deployment
At the time of this README being written. The Detachment-165 project is currently being hosted using GT hosting services with a Plesk server. If you are on Georgia Tech campus, or have access to the [campus VPN](https://faq.oit.gatech.edu/content/how-do-i-get-started-campus-vpn), you can go to hosting.gatech.edu, login with your GT account, go to Plesk Web Admin, and click on afrotc.gatech.edu under the Plesk control panel. If you do not have access to the to the control panel or the afrotc.gatech.edu you should contact one of these people: 
- Captain Babcock cbabcock6@gatech.edu
- Terrell Caldwell tcaldwell30@gatech.edu
- Miguel Garcia mgarcia75@gatech.edu
- Yours Truly, Kyser Montalvo - kmontalvo3@gatech.edu

And one of us should be able to get you access to the plesk server. 

After you have logged into the plesk server, you will see that you can Pull Updates from the master branch of the GitHub repository. This will take all the files from the master branch and deploy them into production for everybody to see. 





