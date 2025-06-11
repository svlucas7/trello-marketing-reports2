# Trello Report Tool

## Overview
The Trello Report Tool is a web application designed to transform exported Trello data into automated executive reports. By processing JSON files from Trello, the tool generates formatted monthly reports tailored to the coordination's requirements.

## Features
- Import Trello JSON data for processing.
- Generate executive reports in multiple formats (PDF, Excel, text, JSON).
- User-friendly HTML report display.
- Metrics calculation and task classification from Trello data.

## Project Structure
```
trello-report-tool
├── src
│   ├── app.ts                     # Entry point of the application
│   ├── controllers
│   │   └── reportController.ts     # Handles report generation requests
│   ├── routes
│   │   └── reportRoutes.ts         # Sets up report-related routes
│   ├── services
│   │   └── trelloProcessor.ts      # Processes Trello JSON data
│   ├── utils
│   │   └── reportFormatter.ts       # Formats report data into specified output formats
│   ├── types
│   │   └── index.ts                # Defines data structures and types
│   └── views
│       └── reportTemplate.html     # HTML template for displaying reports
├── public
│   └── styles.css                  # CSS styles for the application
├── package.json                    # npm configuration file
├── tsconfig.json                   # TypeScript configuration file
└── README.md                       # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd trello-report-tool
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```
2. Access the application in your web browser at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.