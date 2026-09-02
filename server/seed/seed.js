const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orderflow';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // 1. System Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: 'OrderFlow Enterprise Solutions',
        companyLogo: '',
        address: '750 Industrial Parkway, Tech Center, Building B, New York, NY 10001',
        phone: '+1 (800) 555-0199',
        email: 'billing@orderflow-corp.com',
        website: 'www.orderflow-corp.com',
        orderPrefix: 'ORD-',
        defaultUOM: 'PCS',
        defaultOrderStatus: 'Draft'
      });
      console.log('[Seed] Default settings created.');
    }

    // 2. Users (Admin, Manager, Employee)
    let admin = await User.findOne({ email: 'admin@orderflow.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Alex Mercer (Admin)',
        email: 'admin@orderflow.com',
        password: 'Admin123!',
        role: 'ADMIN',
        isActive: true
      });
      console.log('[Seed] Admin user created (admin@orderflow.com / Admin123!)');
    }

    let manager = await User.findOne({ email: 'manager@orderflow.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Sarah Connor (Manager)',
        email: 'manager@orderflow.com',
        password: 'Manager123!',
        role: 'MANAGER',
        isActive: true
      });
      console.log('[Seed] Manager user created (manager@orderflow.com / Manager123!)');
    }

    let employee = await User.findOne({ email: 'employee@orderflow.com' });
    if (!employee) {
      employee = await User.create({
        name: 'David Miller (Employee)',
        email: 'employee@orderflow.com',
        password: 'Employee123!',
        role: 'EMPLOYEE',
        isActive: true
      });
      console.log('[Seed] Employee user created (employee@orderflow.com / Employee123!)');
    }

    // 3. Customers
    const customerCount = await Customer.countDocuments();
    let customersList = [];
    if (customerCount === 0) {
      customersList = await Customer.insertMany([
        {
          name: 'Apex Global Logistics',
          companyName: 'Apex Logistics Inc.',
          contactPerson: 'Robert Vance',
          phone: '+1 (555) 234-5678',
          email: 'purchasing@apexlogistics.com',
          address: '420 Freight Way, Chicago, IL 60607',
          notes: 'Key Tier 1 Logistics Client - Net 30 terms'
        },
        {
          name: 'Zenith Industrial Supplies',
          companyName: 'Zenith Holdings LLC',
          contactPerson: 'Elena Rostova',
          phone: '+1 (555) 345-6789',
          email: 'orders@zenithind.com',
          address: '110 Innovation Drive, San Jose, CA 95134',
          notes: 'Requires custom pallet delivery packaging'
        },
        {
          name: 'Sterling Fabricators',
          companyName: 'Sterling Fabrications Corp',
          contactPerson: 'Marcus Sterling',
          phone: '+1 (555) 456-7890',
          email: 'marcus@sterlingfab.com',
          address: '88 Steelworks Blvd, Pittsburgh, PA 15201',
          notes: 'High volume metal & fastener buyer'
        },
        {
          name: 'Horizon Textile Mills',
          companyName: 'Horizon Apparel Group',
          contactPerson: 'Sophia Chen',
          phone: '+1 (555) 567-8901',
          email: 'schen@horizonapparel.com',
          address: '305 Fashion Avenue, Suite 12, Charlotte, NC 28202',
          notes: 'Cotton yarn & fabric order client'
        },
        {
          name: 'Nexus Tech Components',
          companyName: 'Nexus International',
          contactPerson: 'James Gallagher',
          phone: '+1 (555) 678-9012',
          email: 'j.gallagher@nexuscomp.io',
          address: '500 Silicon Alley, Austin, TX 78701',
          notes: 'Urgent priority dispatch requested on all indents'
        }
      ]);
      console.log(`[Seed] Created ${customersList.length} realistic customers.`);
    } else {
      customersList = await Customer.find();
    }

    // 4. Products
    const productCount = await Product.countDocuments();
    let productsList = [];
    if (productCount === 0) {
      productsList = await Product.insertMany([
        {
          name: 'Premium Combed Cotton Yarn 40s',
          sku: 'SKU-YRN-40S',
          description: '100% Ring Spun Combed Cotton Yarn 40s Count for Knitting & Weaving',
          category: 'Textiles & Yarn',
          defaultUOM: 'KG'
        },
        {
          name: 'Heavy Duty Corrugated Shipping Boxes 24x18x18',
          sku: 'SKU-BOX-2418',
          description: 'Double Wall 200# ECT-48 Heavy Duty Corrugated Packaging Box',
          category: 'Packaging',
          defaultUOM: 'Cartons'
        },
        {
          name: 'Stainless Steel Socket Cap Screws M8x30mm',
          sku: 'SKU-FST-M830',
          description: 'Grade 316 Marine Stainless Steel Allen Socket Head Bolts',
          category: 'Hardware & Fasteners',
          defaultUOM: 'Boxes'
        },
        {
          name: 'Industrial Heavy Duty Nitrile Gloves XL',
          sku: 'SKU-GLV-NTR-XL',
          description: 'Powder-Free 8 mil Heavy Duty Chemical Resistant Nitrile Work Gloves',
          category: 'Safety & PPE',
          defaultUOM: 'Boxes'
        },
        {
          name: 'High Density Polyethylene (HDPE) Film Roll 1000mm',
          sku: 'SKU-PLY-HDPE10',
          description: 'Clear Industrial Grade HDPE Protective Wrapping Film Roll (50 Micron)',
          category: 'Plastics & Film',
          defaultUOM: 'Meters'
        },
        {
          name: 'Silk Blend Satin Weave Fabric (Natural White)',
          sku: 'SKU-FBC-SLK01',
          description: 'Premium Satin Weave Silk Blend Fabric Roll 54 inch Width',
          category: 'Textiles & Yarn',
          defaultUOM: 'Meters'
        },
        {
          name: 'Precision Machined Brass Fittings 1/2" NPT',
          sku: 'SKU-FIT-BRS-12',
          description: 'Brass Hex Nipple Threaded Pipe Fitting 1/2 Inch NPT Male',
          category: 'Plumbing & Valves',
          defaultUOM: 'PCS'
        },
        {
          name: 'Polypropylene High Tensile Strapping Tape 19mm',
          sku: 'SKU-TAP-PP19',
          description: 'Heavy Duty Pallet Strapping Tape 1000m Coil',
          category: 'Packaging',
          defaultUOM: 'Sets'
        },
        {
          name: 'Eco Synthetic Polyester Mesh Netting',
          sku: 'SKU-MSH-SYN-05',
          description: 'UV Stabilized High Strength Synthetic Mesh Roll 2m x 50m',
          category: 'Industrial',
          defaultUOM: 'Meters'
        },
        {
          name: 'Double-Sided Acrylic Foam Adhesive Tape Roll 25mm',
          sku: 'SKU-TAP-ACR25',
          description: 'High Bond Structural Assembly Double Sided Acrylic Foam Tape',
          category: 'Adhesives & Tapes',
          defaultUOM: 'Dozens'
        }
      ]);
      console.log(`[Seed] Created ${productsList.length} realistic products.`);
    } else {
      productsList = await Product.find();
    }

    // 5. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && customersList.length >= 5 && productsList.length >= 10) {
      const sampleOrders = [
        {
          orderNumber: 'ORD-000101',
          customer: customersList[0]._id,
          date: new Date('2026-08-15'),
          poNumber: 'PO-78901',
          indentNumber: 'IND-4001',
          status: 'Completed',
          products: [
            {
              product: productsList[0]._id,
              productName: productsList[0].name,
              description: productsList[0].description,
              quantity: 2500,
              uom: 'KG',
              position: 1
            },
            {
              product: productsList[1]._id,
              productName: productsList[1].name,
              description: productsList[1].description,
              quantity: 150,
              uom: 'Cartons',
              position: 2
            }
          ],
          createdBy: admin._id,
          updatedBy: admin._id,
          history: [
            {
              user: admin._id,
              userName: admin.name,
              action: 'CREATED',
              field: 'Order',
              previousValue: '',
              newValue: 'Created Order ORD-000101',
              timestamp: new Date('2026-08-15')
            },
            {
              user: admin._id,
              userName: admin.name,
              action: 'STATUS_CHANGED',
              field: 'Status',
              previousValue: 'Processing',
              newValue: 'Completed',
              timestamp: new Date('2026-08-18')
            }
          ]
        },
        {
          orderNumber: 'ORD-000102',
          customer: customersList[1]._id,
          date: new Date('2026-08-20'),
          poNumber: 'PO-88421',
          indentNumber: 'IND-4002',
          status: 'Processing',
          products: [
            {
              product: productsList[2]._id,
              productName: productsList[2].name,
              description: productsList[2].description,
              quantity: 50,
              uom: 'Boxes',
              position: 1
            },
            {
              product: productsList[3]._id,
              productName: productsList[3].name,
              description: productsList[3].description,
              quantity: 100,
              uom: 'Boxes',
              position: 2
            },
            {
              product: productsList[7]._id,
              productName: productsList[7].name,
              description: productsList[7].description,
              quantity: 20,
              uom: 'Sets',
              position: 3
            }
          ],
          createdBy: manager._id,
          updatedBy: manager._id,
          history: [
            {
              user: manager._id,
              userName: manager.name,
              action: 'CREATED',
              field: 'Order',
              previousValue: '',
              newValue: 'Created Order ORD-000102',
              timestamp: new Date('2026-08-20')
            }
          ]
        },
        {
          orderNumber: 'ORD-000103',
          customer: customersList[2]._id,
          date: new Date('2026-08-25'),
          poNumber: 'PO-99102',
          indentNumber: 'IND-4003',
          status: 'Submitted',
          products: [
            {
              product: productsList[6]._id,
              productName: productsList[6].name,
              description: productsList[6].description,
              quantity: 1200,
              uom: 'PCS',
              position: 1
            },
            {
              product: productsList[2]._id,
              productName: productsList[2].name,
              description: productsList[2].description,
              quantity: 80,
              uom: 'Boxes',
              position: 2
            }
          ],
          createdBy: employee._id,
          updatedBy: employee._id,
          history: [
            {
              user: employee._id,
              userName: employee.name,
              action: 'CREATED',
              field: 'Order',
              previousValue: '',
              newValue: 'Created Order ORD-000103 as Draft',
              timestamp: new Date('2026-08-25')
            },
            {
              user: employee._id,
              userName: employee.name,
              action: 'STATUS_CHANGED',
              field: 'Status',
              previousValue: 'Draft',
              newValue: 'Submitted',
              timestamp: new Date('2026-08-26')
            }
          ]
        },
        {
          orderNumber: 'ORD-000104',
          customer: customersList[3]._id,
          date: new Date('2026-08-28'),
          poNumber: 'PO-10452',
          indentNumber: 'IND-4004',
          status: 'Draft',
          products: [
            {
              product: productsList[5]._id,
              productName: productsList[5].name,
              description: productsList[5].description,
              quantity: 850,
              uom: 'Meters',
              position: 1
            },
            {
              product: productsList[0]._id,
              productName: productsList[0].name,
              description: productsList[0].description,
              quantity: 1200,
              uom: 'KG',
              position: 2
            }
          ],
          createdBy: employee._id,
          updatedBy: employee._id,
          history: [
            {
              user: employee._id,
              userName: employee.name,
              action: 'CREATED',
              field: 'Order',
              previousValue: '',
              newValue: 'Created Draft Order ORD-000104',
              timestamp: new Date('2026-08-28')
            }
          ]
        },
        {
          orderNumber: 'ORD-000105',
          customer: customersList[4]._id,
          date: new Date('2026-08-30'),
          poNumber: 'PO-11209',
          indentNumber: 'IND-4005',
          status: 'Draft',
          products: [
            {
              product: productsList[4]._id,
              productName: productsList[4].name,
              description: productsList[4].description,
              quantity: 3000,
              uom: 'Meters',
              position: 1
            },
            {
              product: productsList[9]._id,
              productName: productsList[9].name,
              description: productsList[9].description,
              quantity: 45,
              uom: 'Dozens',
              position: 2
            }
          ],
          createdBy: admin._id,
          updatedBy: admin._id,
          history: [
            {
              user: admin._id,
              userName: admin.name,
              action: 'CREATED',
              field: 'Order',
              previousValue: '',
              newValue: 'Created Order ORD-000105',
              timestamp: new Date('2026-08-30')
            }
          ]
        }
      ];

      await Order.insertMany(sampleOrders);
      console.log('[Seed] Created sample orders across Draft, Submitted, Processing, Completed.');
    }

    // 6. Log Initial Activity
    const logCount = await ActivityLog.countDocuments();
    if (logCount === 0 && admin) {
      await ActivityLog.create({
        user: admin._id,
        userName: admin.name,
        userEmail: admin.email,
        action: 'SYSTEM_SEED',
        entityType: 'Settings',
        entityId: settings._id.toString(),
        entityName: 'OrderFlow Database',
        description: 'Initialized system seed data with default Admin, Customers, Products, and Sample Orders.'
      });
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
