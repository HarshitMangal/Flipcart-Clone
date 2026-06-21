import { createContext, useState } from "react";

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

    return (
        <DataContext.Provider
            value={{
                account,
                setAccount: setAccountState,
                role,
                setRole: setRoleState,
                isLoginOpen,
                setIsLoginOpen
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;