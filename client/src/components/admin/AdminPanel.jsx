import React, { useState, useEffect, useContext } from 'react';
import { 
    Box, Typography, Tab, Tabs, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, 
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, 
    IconButton, Grid, Card, CardContent, Divider, Alert, CircularProgress, styled 
} from '@mui/material';
import { Delete, Edit, Add, Refresh, ShoppingBag, LocalShipping } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DataContext } from '../../context/dataprovider';

// Styled Components for Flipkart Look
const Container = styled(Box)`
    padding: 30px 5%;
    background-color: #f1f3f6;
    min-height: 90vh;
`;

const HeaderBox = styled(Box)`
    background: #2874f0;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    margin-bottom: 20px;
    box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
`;

const StyledPaper = styled(Paper)`
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    overflow: hidden;
`;

const ImageThumbnail = styled('img')({
    width: 50,
    height: 50,
    objectFit: 'contain'
});

const AdminPanel = () => {
    const { account, role } = useContext(DataContext);
    const [tabIndex, setTabIndex] = useState(0);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Alert Notification State
    const [alertMsg, setAlertMsg] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    // Dialog form states
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newStock, setNewStock] = useState(0);

    const [newProduct, setNewProduct] = useState({
        url: '',
        detailUrl: '',
        shortTitle: '',
        longTitle: '',
        mrp: '',
        cost: '',
        discount: '',
        quantity: 10,
        description: '',
        tagline: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const showNotification = (msg, severity = 'success') => {
        setAlertMsg(msg);
        setAlertSeverity(severity);
        setTimeout(() => setAlertMsg(''), 4000);
    };

    // 1. Backend se products load karna
    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await axios.get('http://localhost:8000/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
            showNotification("Failed to fetch products", "error");
        } finally {
            setLoadingProducts(false);
        }
    };

    // 2. Backend se saare orders load karna
    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await axios.get('http://localhost:8000/api/admin/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders", error);
            showNotification("Failed to fetch orders", "error");
        } finally {
            setLoadingOrders(false);
        }
    };

    // 3. Dummy JSON se products database seed/import karna
    const handleImportProducts = async () => {
        try {
            showNotification("Importing sample products... please wait", "info");
            const response = await axios.get('http://localhost:8000/api/products/import');
            showNotification(response.data.message || "Products imported successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error importing products", error);
            showNotification("Failed to import products", "error");
        }
    };

    // 3b. Default Flipkart products restore/reset karna
    const handleResetProducts = async () => {
        if (!window.confirm("Are you sure you want to delete current products and restore all default Flipkart products?")) return;
        try {
            showNotification("Restoring default products... please wait", "info");
            const response = await axios.get('http://localhost:8000/api/products/reset');
            showNotification(response.data.message || "Default products restored successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error resetting products", error);
            showNotification("Failed to restore products", "error");
        }
    };

    // 4. Naya product add karne ki request
    const handleAddProductSubmit = async () => {
        const { shortTitle, longTitle, mrp, cost, url } = newProduct;

        // Validation
        if (!shortTitle || !longTitle || !mrp || !cost || !url) {
            showNotification("Please fill all required fields", "warning");
            return;
        }

        const payload = {
            url: newProduct.url,
            detailUrl: newProduct.detailUrl || newProduct.url,
            title: {
                shortTitle: newProduct.shortTitle,
                longTitle: newProduct.longTitle
            },
            price: {
                mrp: Number(newProduct.mrp),
                cost: Number(newProduct.cost),
                discount: newProduct.discount || `${Math.round(((newProduct.mrp - newProduct.cost)/newProduct.mrp)*100)}% Off`
            },
            quantity: Number(newProduct.quantity),
            description: newProduct.description,
            discount: newProduct.discount || `${Math.round(((newProduct.mrp - newProduct.cost)/newProduct.mrp)*100)}% Off`,
            tagline: newProduct.tagline || 'Special Offer'
        };

        try {
            const response = await axios.post('http://localhost:8000/api/admin/products', payload);
            showNotification("Product added successfully!");
            setOpenAddDialog(false);
            setNewProduct({
                url: '', detailUrl: '', shortTitle: '', longTitle: '',
                mrp: '', cost: '', discount: '', quantity: 10, description: '', tagline: ''
            });
            fetchProducts();
        } catch (error) {
            console.error("Error adding product", error);
            showNotification(error.response?.data?.message || "Failed to add product", "error");
        }
    };

    // 5. Product delete karne ki request
    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`http://localhost:8000/api/admin/products/${id}`);
            showNotification("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product", error);
            showNotification("Failed to delete product", "error");
        }
    };

    // 6. Product stock edit/update karne ki request
    const handleUpdateStock = async () => {
        if (!selectedProduct) return;

        try {
            await axios.put(`http://localhost:8000/api/admin/products/${selectedProduct.id}`, {
                quantity: Number(newStock)
            });
            showNotification("Stock level updated successfully!");
            setOpenStockDialog(false);
            fetchProducts();
        } catch (error) {
            console.error("Error updating stock", error);
            showNotification("Failed to update stock", "error");
        }
    };

    // 7. Order status update karne ki request (Mera progress stepper update karne ke liye!)
    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:8000/api/admin/orders/${orderId}`, {
                orderStatus: newStatus
            });
            showNotification(`Order status updated to "${newStatus}"`);
            fetchOrders(); // Refresh order table
        } catch (error) {
            console.error("Error updating order status", error);
            showNotification("Failed to update order status", "error");
        }
    };

    if (!account) {
        return (
            <Container>
                <Paper style={{ padding: '50px', textAlign: 'center', margin: '80px auto', maxWidth: '600px', borderRadius: '8px' }}>
                    <Typography variant="h5" color="error" gutterBottom style={{ fontWeight: 600 }}>
                        Login Required 🔒
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        You must log in to access the Seller & Admin Panel.
                    </Typography>
                    <Button variant="contained" style={{ backgroundColor: '#2874f0', color: '#fff', textTransform: 'none' }} component={Link} to="/">
                        Go to Home
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (role !== 'seller' && role !== 'admin') {
        return (
            <Container>
                <Paper style={{ padding: '50px', textAlign: 'center', margin: '80px auto', maxWidth: '600px', borderRadius: '8px', boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)' }}>
                    <Typography variant="h5" color="error" gutterBottom style={{ fontWeight: 600 }}>
                        Access Denied 🔒
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        You do not have seller privileges. To access this dashboard, please register as a seller first.
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2} mt={3}>
                        <Button variant="contained" style={{ backgroundColor: '#fb641b', color: '#fff', textTransform: 'none' }} component={Link} to="/seller/onboarding">
                            Become a Seller
                        </Button>
                        <Button variant="outlined" style={{ color: '#2874f0', border: '1px solid #2874f0', textTransform: 'none' }} component={Link} to="/">
                            Back to Home
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container>
            {/* Top Header Card */}
            <HeaderBox>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Flipkart Admin Panel</Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Manage your catalog, stock quantities, and customer shipping workflows</Typography>
            </HeaderBox>

            {/* Notification message */}
            {alertMsg && (
                <Alert severity={alertSeverity} sx={{ marginBottom: 2 }}>
                    {alertMsg}
                </Alert>
            )}

            {/* Tabs for Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
                <Tabs value={tabIndex} onChange={(e, index) => setTabIndex(index)} textColor="primary" indicatorColor="primary">
                    <Tab label="📦 Manage Products" sx={{ textTransform: 'none', fontWeight: 600 }} />
                    <Tab label="🚚 Manage Orders" sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
            </Box>

            {/* 1. MANAGE PRODUCTS TAB */}
            {tabIndex === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            style={{ backgroundColor: '#2874f0', color: '#fff', textTransform: 'none' }}
                            onClick={() => setOpenAddDialog(true)}
                        >
                            Add New Product
                        </Button>
                        
                        <Box display="flex" gap={2}>
                            <Button 
                                variant="outlined" 
                                startIcon={<Refresh />} 
                                style={{ borderColor: '#2874f0', color: '#2874f0', textTransform: 'none' }}
                                onClick={fetchProducts}
                            >
                                Reload Inventory
                            </Button>
                            
                            <Button 
                                variant="outlined" 
                                color="warning" 
                                style={{ textTransform: 'none' }}
                                onClick={handleImportProducts}
                            >
                                Import Sample Products
                            </Button>
                            
                            <Button 
                                variant="outlined" 
                                color="error" 
                                style={{ textTransform: 'none' }}
                                onClick={handleResetProducts}
                            >
                                Restore Default Products
                            </Button>
                        </Box>
                    </Box>

                    {loadingProducts ? (
                        <Box display="flex" justifyContent="center" py={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <StyledPaper>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ backgroundColor: '#f2f2f2' }}>
                                        <TableRow>
                                            <TableCell>Image</TableCell>
                                            <TableCell>Short Title</TableCell>
                                            <TableCell>Long Title</TableCell>
                                            <TableCell>Cost / MRP</TableCell>
                                            <TableCell>Discount</TableCell>
                                            <TableCell>Stock Left</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((prod) => (
                                            <TableRow key={prod.id} hover>
                                                <TableCell><ImageThumbnail src={prod.url} alt="" /></TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{prod.title?.shortTitle}</TableCell>
                                                <TableCell>{prod.title?.longTitle?.substring(0, 50)}...</TableCell>
                                                <TableCell>₹{prod.price?.cost} / <span style={{ textDecoration: 'line-through', color: '#878787', fontSize: '12px' }}>₹{prod.price?.mrp}</span></TableCell>
                                                <TableCell>{prod.price?.discount}</TableCell>
                                                <TableCell sx={{ color: prod.quantity === 0 ? 'red' : 'inherit', fontWeight: prod.quantity === 0 ? 600 : 'normal' }}>
                                                    {prod.quantity === 0 ? 'OUT OF STOCK' : prod.quantity}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton color="primary" onClick={() => {
                                                        setSelectedProduct(prod);
                                                        setNewStock(prod.quantity);
                                                        setOpenStockDialog(true);
                                                    }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton color="error" onClick={() => handleDeleteProduct(prod.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </StyledPaper>
                    )}
                </Box>
            )}

            {/* 2. MANAGE ORDERS TAB */}
            {tabIndex === 1 && (
                <Box>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button 
                            variant="outlined" 
                            startIcon={<Refresh />} 
                            style={{ borderColor: '#2874f0', color: '#2874f0', textTransform: 'none' }}
                            onClick={fetchOrders}
                        >
                            Refresh Orders
                        </Button>
                    </Box>

                    {loadingOrders ? (
                        <Box display="flex" justifyContent="center" py={5}>
                            <CircularProgress />
                        </Box>
                    ) : orders.length === 0 ? (
                        <Paper sx={{ padding: 4, textAlign: 'center' }}>
                            <Typography color="textSecondary">No customer orders have been logged yet.</Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {orders.map((order) => (
                                <Grid item xs={12} key={order._id}>
                                    <StyledPaper sx={{ padding: 2, borderLeft: '6px solid #2874f0' }}>
                                        <Grid container spacing={2} alignItems="center">
                                            {/* Order Details Column */}
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="subtitle2" color="primary">Order ID: #{order._id}</Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    <strong>Username:</strong> {order.username}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                                                    Total Bill: ₹{order.totalAmount}
                                                </Typography>
                                            </Grid>

                                            {/* Products ordered list */}
                                            <Grid item xs={12} md={5}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Ordered Products:</Typography>
                                                <Box display="flex" flexDirection="column" gap={1}>
                                                    {order.products?.map((item, idx) => (
                                                        <Box key={idx} display="flex" alignItems="center" gap={1.5}>
                                                            <img src={item.url} alt="" style={{ width: 35, height: 35, objectFit: 'contain' }} />
                                                            <Typography style={{ fontSize: '13px' }}>
                                                                {item.title?.shortTitle} (Qty: {item.quantity || 1}) - ₹{item.price?.cost}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Grid>

                                            {/* Tracking Update Column */}
                                            <Grid item xs={12} md={3}>
                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Update Status:</Typography>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                                        sx={{
                                                            fontSize: '14px',
                                                            backgroundColor: 
                                                                order.orderStatus === 'Delivered' ? '#e2f0d9' : 
                                                                order.orderStatus === 'Shipped' ? '#cce0ff' : '#fff3cd'
                                                        }}
                                                    >
                                                        <MenuItem value="Ordered">Ordered ⏳</MenuItem>
                                                        <MenuItem value="Shipped">Shipped 📦</MenuItem>
                                                        <MenuItem value="Out for Delivery">Out for Delivery 🚚</MenuItem>
                                                        <MenuItem value="Delivered">Delivered ✅</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </StyledPaper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* A. DIALOG: ADD PRODUCT */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Product to Catalog</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField 
                                label="Short Title (e.g. SmartWatch)*" 
                                fullWidth size="small"
                                value={newProduct.shortTitle}
                                onChange={(e) => setNewProduct({...newProduct, shortTitle: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Long Title (Full Product Name)*" 
                                fullWidth size="small"
                                value={newProduct.longTitle}
                                onChange={(e) => setNewProduct({...newProduct, longTitle: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="MRP Price (₹)*" 
                                type="number" fullWidth size="small"
                                value={newProduct.mrp}
                                onChange={(e) => setNewProduct({...newProduct, mrp: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Selling Price (Cost ₹)*" 
                                type="number" fullWidth size="small"
                                value={newProduct.cost}
                                onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Discount String (optional: e.g. 20% Off)" 
                                fullWidth size="small"
                                value={newProduct.discount}
                                onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Stock Quantity (inventory)" 
                                type="number" fullWidth size="small"
                                value={newProduct.quantity}
                                onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Image URL*" 
                                fullWidth size="small"
                                value={newProduct.url}
                                onChange={(e) => setNewProduct({...newProduct, url: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Detail Image URL (optional)" 
                                fullWidth size="small"
                                value={newProduct.detailUrl}
                                onChange={(e) => setNewProduct({...newProduct, detailUrl: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Brand/Tagline (optional)" 
                                fullWidth size="small"
                                value={newProduct.tagline}
                                onChange={(e) => setNewProduct({...newProduct, tagline: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Product Description" 
                                multiline rows={3} fullWidth size="small"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleAddProductSubmit} variant="contained" style={{ backgroundColor: '#2874f0', color: '#fff' }}>Add Product</Button>
                </DialogActions>
            </Dialog>

            {/* B. DIALOG: EDIT STOCK */}
            <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)}>
                <DialogTitle>Edit Inventory Level</DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Update the available stock count for: <br />
                        <strong>{selectedProduct?.title?.longTitle}</strong>
                    </Typography>
                    <TextField 
                        label="Available Stock" 
                        type="number" 
                        fullWidth 
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStockDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStock} variant="contained" style={{ backgroundColor: '#2874f0', color: '#fff' }}>Save Stock</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default AdminPanel;
