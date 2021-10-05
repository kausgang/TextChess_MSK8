@REM on Windows

cd UserMoveHandler
call npm install 
start /max npm start

cd ..
cd EngineMoveHandler
call npm install 
start /max npm start

cd ..
cd ENGINE
call npm install 
start /max npm start

cd ..
start chrome %cd%/CLIENT/code/index.html
