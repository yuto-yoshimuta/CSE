# CashScanExplorer
<details><summary><h1>Project Development Startup</h1></summary>

# Project Setup Procedure

### Prerequisites
- Docker Desktop must be installed.
- VSCode must be installed.

### Steps
1. Open Command Prompt or Terminal and navigate to the project directory.(It is recommended to work within VSCode.)
   ```
   cd CSE
   ```

2. Run the following command to build the Docker image.
   (Make sure Docker Desktop is running.)
   (This process may take around 3 minutes depending on your PC's specifications and condition.)
   ```
   docker-compose build
   ```

3. Once the build is complete, start the Docker container using the      following command
   ```
   docker-compose up -d
   ```

4. Add the required extension to VSCode (skip this step if it is already installed).
   Search for Dev Containers in the Extensions tab and install it.
   If a >< icon appears at the bottom left and a monitor icon with >< is visible in the left sidebar, the setup is correct.

5. Enter the container
  Select the monitor icon with >< (Remote Explorer) and check if a development container like "cse_Project" is listed.
  If listed, the container has started successfully.
   ```
   # Check the container status
   docker-compose ps
   ```
Hover over the running container, and a → icon will appear. Click on it and select "Attach to Current Window.

6. Select the project folder
   Once inside the container, define the current path.
   Use "Open Folder" to navigate to the root directory.
   Since the OS is Linux, you can search using Ctrl+P or navigate using the cd and ls commands in the terminal.

7. Clone the git project inside the container.
   Clone the CSEProject using the following command
   ```
   git clone https://github.com/yuto-yoshimuta/CSE.git
   ```
   If the cloning fails, it might be due to user settings not being configured. In that case, investigate and set your username and email address in Git.
   If the cloning is successful, the path should be root/CSE.
   
   
8.Run the following code
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

9. Run the main project
   Execute under the path: CSE_Project
   ```
   python manage.py runserver
   ```
   Access the generated localhost URL to complete the process.

10. For mobile access (temporary deployment)
    Prerequisites: Install ngrok and create an ngrok account.
   Define the generated localhost URL as ○○ and run the following command
   ```
   ngrok http ○○
   ```

11. Docker down
   Launch the Docker Desktop application on your machine and stop the container.

   or

   Once the work is completed, you can stop the container using the following command
   ```
   docker-compose down
   ```

### ※Notes
Note that Git branches and work history are not shared between the host machine and the container, so be careful when switching between them.
Once the container is created, you can skip the setup steps in the future and just start the container and access it using the same procedure.
You can start the container by entering the up command, or you can start it directly from Docker Desktop. Personally, the latter method is recommended.

### Useful Commands
- display the container logs
```
docker-compose logs
```

- check the container status
```
docker-compose ps
```

- completely remove the containers and images (cleanup)
```
docker-compose down --rmi all
```
</details>

