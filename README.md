# Financial Management System in Educational Institutions - Front End

This is the front-end application for the Financial Management System in Educational Institutions. The project is built with React and TypeScript and provides a comprehensive platform for managing finances, orders, products, staff, and more for educational institutions, municipalities, and suppliers.

## Features

- **User Authentication:** Register and login for different roles (Admin, Komunë, Shkollë, Kompani).
- **Order Management:** Create, view, filter, and export orders. Generate PDF reports and invoices.
- **Product Inventory:** Manage product registry, update stock, and track inventory statistics.
- **Financial Operations:** Track deductions, additional hours, and budget allocations.
- **Reporting:** Generate and download detailed PDF reports for orders and transaction history.
- **Responsive UI:** Modern, responsive design with dashboards and data visualization.
- **Role-Based Access:** Different dashboards and functionalities for each user type.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-org/Financial_management_system_in_educational_institutions_FRONT_END.git
   cd Financial_management_system_in_educational_institutions_FRONT_END
   ```

2. Install Dependencies

```bash
npm install
#or 
yarn install
```

3. Configure environment variables:

Copy `.env.example` to `.env.development` and set `REACT_APP_API_URL` to your backend API URL.

4. Start the development server:

``` bash
npm start
# or 
yarn start
```

5. Open http://localhost:3000 in your browser. There is also a docker image at oltvr/ssh-front

## Technologies used
- React with TypeScript
- Tailwind CSS for styling
- Formik and Yup for forms and validation
- Axios for API requests
- jsPDF and jspdf-autotable for PDF generation
- Chart.js for data visualization
- SweetAlert2 for alerts and confirmations

## License

This project is licensed under the MIT License.
---
Developed by Fiek Students
