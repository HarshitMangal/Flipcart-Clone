import React from 'react';
import { Box, Typography, Grid, Divider, Link, styled } from '@mui/material';
import { CardGiftcard, HelpOutline, Store, WorkOutline } from '@mui/icons-material';

// Styled Components for Flipkart Premium Dark Footer
const FooterContainer = styled(Box)`
    background-color: #172337;
    color: #fff;
    padding: 50px 8% 20px 8%;
    font-family: Roboto, Arial, sans-serif;
    margin-top: 40px;
    font-size: 12px;
`;

const ColumnTitle = styled(Typography)`
    color: #878787;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 15px;
    text-transform: uppercase;
`;

const FooterLink = styled(Link)`
    color: #fff;
    display: block;
    text-decoration: none;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 400;
    &:hover {
        text-decoration: underline;
    }
`;

const AddressText = styled(Typography)`
    color: #fff;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 8px;
`;

const BottomBar = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 25px;
    margin-top: 25px;
    border-top: 1px solid #454d5e;
    flex-wrap: wrap;
    gap: 15px;
`;

const BottomLink = styled(Link)`
    color: #fff;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    &:hover {
        color: #2874f0;
    }
`;

const Footer = () => {
    return (
        <FooterContainer>
            <Grid container spacing={4}>
                {/* 1. ABOUT Column */}
                <Grid item xs={12} sm={6} md={2}>
                    <ColumnTitle>About</ColumnTitle>
                    <FooterLink href="#">Contact Us</FooterLink>
                    <FooterLink href="#">About Us</FooterLink>
                    <FooterLink href="#">Careers</FooterLink>
                    <FooterLink href="#">Flipkart Stories</FooterLink>
                    <FooterLink href="#">Press</FooterLink>
                    <FooterLink href="#">Corporate Information</FooterLink>
                </Grid>

                {/* 2. HELP Column */}
                <Grid item xs={12} sm={6} md={2}>
                    <ColumnTitle>Help</ColumnTitle>
                    <FooterLink href="#">Payments</FooterLink>
                    <FooterLink href="#">Shipping</FooterLink>
                    <FooterLink href="#">Cancellation & Returns</FooterLink>
                    <FooterLink href="#">FAQ</FooterLink>
                    <FooterLink href="#">Report Infringement</FooterLink>
                </Grid>

                {/* 3. CONSUMER POLICY Column */}
                <Grid item xs={12} sm={6} md={2}>
                    <ColumnTitle>Consumer Policy</ColumnTitle>
                    <FooterLink href="#">Cancellation & Returns</FooterLink>
                    <FooterLink href="#">Terms Of Use</FooterLink>
                    <FooterLink href="#">Security</FooterLink>
                    <FooterLink href="#">Privacy</FooterLink>
                    <FooterLink href="#">Sitemap</FooterLink>
                    <FooterLink href="#">Grievance Redressal</FooterLink>
                    <FooterLink href="#">EPR Compliance</FooterLink>
                </Grid>

                {/* 4. SOCIAL Column */}
                <Grid item xs={12} sm={6} md={2}>
                    <ColumnTitle>Social</ColumnTitle>
                    <FooterLink href="https://facebook.com" target="_blank">Facebook</FooterLink>
                    <FooterLink href="https://twitter.com" target="_blank">Twitter</FooterLink>
                    <FooterLink href="https://youtube.com" target="_blank">YouTube</FooterLink>
                </Grid>

                {/* Vertical Divider for Desktop View */}
                <Grid item md={0.5} sx={{ display: { xs: 'none', md: 'block' }, borderRight: '1px solid #454d5e', height: '150px', mt: 3 }} />

                {/* 5. Mail Us Column */}
                <Grid item xs={12} sm={6} md={1.75}>
                    <ColumnTitle>Mail Us:</ColumnTitle>
                    <AddressText>
                        Flipkart Internet Private Limited,<br />
                        Buildings Alyssa, Begonia &<br />
                        Clove Embassy Tech Village,<br />
                        Outer Ring Road, Devarabeesanahalli Village,<br />
                        Bengaluru, 560103,<br />
                        Karnataka, India
                    </AddressText>
                </Grid>

                {/* 6. Registered Office Address */}
                <Grid item xs={12} sm={6} md={1.75}>
                    <ColumnTitle>Registered Office Address:</ColumnTitle>
                    <AddressText>
                        Flipkart Internet Private Limited,<br />
                        Buildings Alyssa, Begonia &<br />
                        Clove Embassy Tech Village,<br />
                        Outer Ring Road, Devarabeesanahalli Village,<br />
                        Bengaluru, 560103,<br />
                        Karnataka, India<br />
                        CIN : U51109KA2012PTC066107<br />
                        Telephone: 044-45614700
                    </AddressText>
                </Grid>
            </Grid>

            {/* Bottom bar containing icons and copyright */}
            <BottomBar>
                <Box display="flex" gap={4} flexWrap="wrap">
                    <BottomLink href="/admin">
                        <Store sx={{ color: '#ffe500', fontSize: '16px' }} />
                        Become a Seller
                    </BottomLink>
                    <BottomLink href="#">
                        <WorkOutline sx={{ color: '#ffe500', fontSize: '16px' }} />
                        Advertise
                    </BottomLink>
                    <BottomLink href="#">
                        <CardGiftcard sx={{ color: '#ffe500', fontSize: '16px' }} />
                        Gift Cards
                    </BottomLink>
                    <BottomLink href="#">
                        <HelpOutline sx={{ color: '#ffe500', fontSize: '16px' }} />
                        Help Center
                    </BottomLink>
                </Box>

                <Typography style={{ color: '#fff', fontSize: '12px' }}>
                    © 2007-2026 FlipkartClone.com. All rights reserved.
                </Typography>

                <Box display="flex" gap={2} alignItems="center">
                    <img 
                        src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/payment-method_69e7ec.svg" 
                        alt="Payment methods" 
                        style={{ height: 20 }}
                    />
                </Box>
            </BottomBar>
        </FooterContainer>
    );
};

export default Footer;
