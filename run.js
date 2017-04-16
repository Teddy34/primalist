const parameters = require('./parameters');

const connectDB = () => {
	console.info("Database connecting");
	return require('./io/eveSDE').connect(parameters.DB_CONNECTION_STRING);
}

const startWebServer = () => {
	console.info("WebServer starting");
	return require('./server/server').start(parameters.PORT || 8080);
}

const logServiceStarting = (result) => {
	console.info("Service starting");
	return result;
}

const logDBStarting = (result) => {
	console.info("Database starting");
	return result;
}

const logWebServerStarted = (result) => {
	console.info("WebServer started");
	return result;
}

const logError = (error) => {
	console.error("Error while starting the service:", error);
	return Promise.reject(error); // forward the error	to be able to crash
}

// startup workflow
Promise.resolve()
	.then(logServiceStarting)
	.then(connectDB)
	.then(logDBStarting)
	.then(startWebServer)
	.then(logWebServerStarted)
	.catch(logError);

