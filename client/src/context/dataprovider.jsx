import { createContext, useState, useEffect } from "react";

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {

    const savedAccount = localStorage.getItem('account');
    const savedRole = localStorage.getItem('role');

    const validAccount =
        savedAccount &&
        savedAccount !== 'undefined' &&
        savedAccount !== 'null'
            ? savedAccount
            : '';

    const validRole =
        savedRole &&
        savedRole !== 'undefined' &&
        savedRole !== 'null'
            ? savedRole
            : 'user';

    const [account, setAccount] = useState(validAccount);
    const [role, setRole] = useState(validRole);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [localeInfo, setLocaleInfo] = useState({
        country: 'IN',
        currency: 'INR',
        symbol: '₹',
        conversionRate: 1.0
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const testCountry = urlParams.get('country');

        if (testCountry) {
            if (testCountry.toUpperCase() === 'IN') {
                setLocaleInfo({
                    country: 'IN',
                    currency: 'INR',
                    symbol: '₹',
                    conversionRate: 1.0
                });
            } else {
                setLocaleInfo({
                    country: testCountry.toUpperCase(),
                    currency: 'USD',
                    symbol: '$',
                    conversionRate: 1 / 85
                });
            }
            return;
        }

        const detectLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data && data.country_code) {
                    const country = data.country_code.toUpperCase();
                    if (country === 'IN') {
                        setLocaleInfo({
                            country: 'IN',
                            currency: 'INR',
                            symbol: '₹',
                            conversionRate: 1.0
                        });
                    } else {
                        setLocaleInfo({
                            country: country,
                            currency: 'USD',
                            symbol: '$',
                            conversionRate: 1 / 85
                        });
                    }
                }
            } catch (error) {
                console.error("Error detecting geolocation:", error);
            }
        };
        detectLocation();
    }, []);

    const setAccountState = (name) => {
        if (!name || name === 'undefined' || name === 'null') {
            setAccount('');
            setRole('user');
            localStorage.removeItem('account');
            localStorage.removeItem('role');
            return;
        }

        setAccount(name);
        localStorage.setItem('account', name);
    };

    const setRoleState = (newRole) => {
        if (!newRole || newRole === 'undefined' || newRole === 'null') {
            setRole('user');
            localStorage.removeItem('role');
            return;
        }
        setRole(newRole);
        localStorage.setItem('role', newRole);
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '';
        const converted = price * localeInfo.conversionRate;
        return new Intl.NumberFormat(localeInfo.country === 'IN' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: localeInfo.currency,
            maximumFractionDigits: localeInfo.country === 'IN' ? 0 : 2
        }).format(converted);
    };

    return (
        <DataContext.Provider
            value={{
                account,
                setAccount: setAccountState,
                role,
                setRole: setRoleState,
                isLoginOpen,
                setIsLoginOpen,
                localeInfo,
                setLocaleInfo,
                formatPrice
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;