# ETAPS Management System

This is the implementation of ETAPS Managements Systems, created by students of
University Twente under the supervision of Marieke Huisman, at that time the
president of ETAPS Association and chair of ETAPS Steering Committee.

The project consists of two parts – a front-end application built upon ReactJS
and a backend application in Python.

## Requirements
### Frontend
* NodeJS, version 14 works
* npm, corresponding version


### Backend
* Python, at least 3.10
* PIP, corresponding version


## Authors
Design Project Group 6

Aleksandar Petrov | Benjamin Othmer | Daniel Mocanu | Jiayi Tan | Kristiyan Michaylov | Stefan Simionescu


The source code, both frontend and backend, has been adjusted by [Jan Kofron](jan.kofron@d3s.mff.cuni.cz).

For getting an account in the system, please contact [Jan Kofron](jan.kofron@d3s.mff.cuni.cz) or 
[Marieke Huisman](m.huisman@utwente.nl)

The authors' instructions for running it follows:


# 1. Back-end 
## 1.1 Important Files Structure

```

├── app                                            # "app" is a Python package
│   ├── __init__.py                                # this file makes "app" a "Python package"
│   ├── authentication.py                          # jwt token "authentication" (token expired=35 min)
│   ├── main.py                                    # version 1 (latest), "main" module, e.g. import app.main
│   ├── exceptions.py                              # customized "exceptions"
│   └── models                                     # "models" is a "Python subpackage"
│   │   ├── __init__.py                            # makes "models" a "Python subpackage"
│   │   ├── base.py                                # base model, e.g. import app.models.base
│   │   ├── accepted_papers.py                     # accepted_papers model, e.g. import app.models.accepted_papers
│   │   ├── committees.py                          # committees model, e.g. import app.models.committees
│   │   ├── conferences.py                         # conferences model, e.g. import app.models.conferences
│   │   ├── pc_status.py                           # pc_status model, e.g. import app.models.pc_status
│   │   ├── program_types.py                       # program_types model, e.g. import app.models.program_types
│   │   ├── pcs.py                                 # pcs model, e.g. import app.models.pcs
│   │   ├── programs.py                            # programs model, e.g. import app.models.programs
│   │   ├── roles.py                               # roles model, e.g. import app.models.roles
│   │   ├── sessions.py                            # sessions model, e.g. import app.models.sessions
│   │   └── users.py                               # users model, e.g. import app.models.users
│   └── routers                                    # "routers" is a "Python subpackage"
│   │   ├── __init__.py                            # makes "routers" a "Python subpackage"
│   │   ├── accepted_papers.py                     # "accepted_papers" submodule, e.g. import app.routers.accepted_papers
│   │   ├── committees.py                          # "committees" submodule, e.g. import app.routers.committees
│   │   ├── conferences.py                         # "conferences" submodule, e.g. import app.routers.conferences
│   │   ├── exports.py                             # "exports" submodule, e.g. import app.routers.exports
│   │   ├── programs.py                            # "programs" submodule, e.g. import app.routers.programs
│   │   ├── sessions.py                            # "sessions" submodule, e.g. import app.routers.sessions
│   │   └── users.py                               # "users" submodule, e.g. import app.routers.users
│   └── db                                         # "database" is a "Python subpackage" for mongoDB connection
│   │   ├── database.py                            # ... (not implemented)
│   │   ├── settings.py                            # database configuration, e.g. url, port
│   │   └── connection.py                          # mongoDB connection setup and shutdown
│   └── requirements.txt                           # "requirements" list, pip install -r requirements.txt
```

[Structure Guide & Documentation (FastAPI)](https://fastapi.tiangolo.com/tutorial/bigger-applications/)

## 1.2 Usage
1. Create your venv: `$ python -m venv venv`
2. Activate your venv: In vs-code, open the Command Palette (`Ctrl`+`Shift`+`P`) and select the interpreter("venv")
3. Install the required packages: `(venv) $ pip install -r requirements.txt`
    - **DB**: If you encounter "*ERROR: Could not build wheels for cryptography which use PEP 517 and cannot be installed directly*", `python -m pip install --upgrade pip` fixed the issue in my case (windows 10).
4. Later on, if you want to generate a *requirements.txt* file: `(venv) $ pip freeze > requirements.txt`

5. Run the program locally: 
   ```
   cd .\backend\app\
   python -m uvicorn main:app --reload
   ```
6. How to test the backend
    1. Manual test - Swagger:
       - Visit the Swagger UI at [localhost:8000/docs](localhost:8000/docs)
       - Alternatively ReDoc UI at [localhost:8000/redoc](localhost:8000/redoc)
    2.  Automated test - pytest:
       - Install the required packages in `requirements.txt`:
            ```
            pytest
            httpx
            pytest-asyncio
            pytest-cov
            ```
       - Run tests in cmd:
            - run all the tests: `(venv) $ pytest`
            - run all the tests and produce coverage report: `(venv) $ pytest --cov`
            - generate the coverage report in .html: `(venv) $ coverage html`, the generated reports are in directory $\backend\app\htmlcov$, you can view the summary in $index.html$
            - run a specific test file: 
                ```
                (venv) \backend\app> pytest tests/test_main.py
                (venv) \backend\app> pytest tests/test_routers/[test_xxx.py]
                ```

   

# 2. Front-end

1. NodeJS - https://nodejs.org/en/download 

   1.  Download and install NodeJS from the link above and choose the correct version for your machine (Windows, MacOS) 
   2.  Follow the installation steps 
   3.  Once the installation is finished, check if npm is installed on the machine by typing `npm -v`
2.  Navigate to the frontend folder of the project
    1.  Install the dependencies, using `npm install` inside the frontend folder
    2.  The process might take some time
    3.  After finishing, new package files should be added, alongside a node_modules folder
    4.  To run the frontend, type inside the frontend folder `npm start` 
    5.  In case of Issues: Be aware that the "path" to your directory may not include special characters (this is a problem related to Node )
3. Testing
   1. Install Selenium IDE in a browser
   2. Open the Selenium IDE
   3. On the top left corner select Test suites from the dropdown button
   4. Click on the first test of the first suite and click on the button run all tests in suite
   5. Repeat that for each suite.
   - Note: suites are ordered in alphabetical order, the suite "Admin conference system warnings" should be run after the suite "Non admin Conference system"
   
