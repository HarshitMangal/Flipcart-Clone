import { createContext, useState } from "react";

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {

    const savedAccount = localStorage.getItem('account');

    const validAccount =
        savedAccount &&
        savedAccount !== 'undefined' &&
        savedAccount !== 'null'
            ? savedAccount
            : '';

    const [account, setAccount] = useState(validAccount);

    const setAccountState = (name) => {
        if (!name || name === 'undefined' || name === 'null') {
            setAccount('');
            localStorage.removeItem('account');
            return;
        }

        setAccount(name);
        localStorage.setItem('account', name);
    };

    return (
        <DataContext.Provider
            value={{
                account,
                setAccount: setAccountState
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;