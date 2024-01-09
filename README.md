# Derivatives Payoff Chart Project

## Overview

The Derivatives Payoff Chart Project allows users to visualize the payoff chart based on derivatives bought and sold. Real-time data is obtained from the Shoonya broker (Finvisia) using the ShoonyaApi-js.

**To see the project:**
- Clone the repository.
- In the "front" folder, run `npm install` to install all dependencies.
- Create a new folder called "dependencies" in the "backend" directory.
- Clone the ShoonyaApi-js repository into the "dependencies" folder (`https://github.com/Shoonya-Dev/ShoonyaApi-js/tree/master`).
- Obtain your credentials **from the broker Shoonya** for real-time data.
- Update your credentials in the "cred.js" file within the "functions" folder.

Start the backend and run the React development server in the front to view the project.

---

## Future Developments:

- **Data Source Enhancement:**
  - Replace Shoonya-Api with data from the NSE website for improved data sourcing.

- **User Flexibility:**
  - Provide an option for users to dynamically change the value of the derivatives they are going to buy/sell.

- **Graph Enhancements:**
  - Update the graph to include a vertical and horizontal trace from the cursor's position, improving chart readability.

---

## Instructions

1. Clone the repository:

    ```bash
    git clone https://github.com/hikey-dj/Hayufin.git
    ```

2. Install front-end dependencies:

    ```bash
    cd front
    npm install
    ```

3. Set up backend dependencies:

    ```bash
    cd backend
    mkdir dependencies
    cd dependencies
    git clone https://github.com/Shoonya-Dev/ShoonyaApi-js/tree/master
    ```

4. Update credentials:

    - Obtain credentials from Shoonya and update them in `functions/cred.js`.

5. Start the project:

    - Start the backend.
    
    ```bash
    # In the backend folder
    node fetch.js
    ```

    - Run the React development server in the front.

    ```bash
    # In the front folder
    npm start
    ```

---

Feel free to contribute and stay tuned for future updates!
