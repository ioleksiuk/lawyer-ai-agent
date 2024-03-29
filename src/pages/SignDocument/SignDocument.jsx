import {  Button, CircularProgress, Container } from "@mui/material";
import { useEffect,  useState } from "react";
import Web3 from 'web3';
import { abi as contractABI } from "../CustomTool/abi"
import useSignDocumentId from "./useDocumentId";

const contractAddress = '0x3fA5fC9F93472d76fF7b8f541F13A95cf5667A17';


const SignDocument = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [status, setStatus] = useState('Unsigned');
    const [signSuccess, setSignSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const documentHash = useSignDocumentId();

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.enable();
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccounts(accounts);
                    const contractInstance = new web3Instance.eth.Contract(
                        contractABI,
                        contractAddress
                    );
                    setContract(contractInstance);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        initWeb3();
    }, []);

    

    const signDocument = async () => {
        if (!contract || !accounts || !accounts[0]) {
            console.error('Contract or accounts not initialized');
            return;
        }
        
        if (!documentHash) {
            console.error('Document hash not available');
            return;
        }
        
        setIsLoading(true);
        try {
            await contract.methods.signDocument(documentHash).send({ from: accounts[0] });
            setStatus('Document signed successfully.');
            setSignSuccess(true);
        } catch (error) {
            console.error(error);
            setStatus('Failed to sign document.');
        }

        setIsLoading(false);
    };
    


    return <Container 
        maxWidth="md" 
        sx={{ 
            marginBottom: '150px', 
            background: 'linear-gradient(130deg, #e74c3c 0, #78378c 100%)',
            minHeight: '100vh',
            padding: '0',
            margin: '0 !important',
            maxWidth: '100% !important'
        }}>
        
        <div style={{width: '100%', margin: '0 auto', paddingBottom: '150px', display: 'flex', justifyContent: 'center' }}>
            {documentHash && (
                <div style={{display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {!signSuccess && <>
                        <h3>Please sign the document with hash {documentHash}</h3>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px'}}>
                            
                            <Button 
                                disabled={!documentHash} 
                                onClick={signDocument} 
                                variant="contained" 
                                color="primary" 
                                sx={{marginBottom: '24px', width: '158px'
                            }}>Sign Document</Button>

                            <p>Status: {status}</p>

                            {isLoading && <CircularProgress size={"24px"} sx={{margin: '0 auto' }} />}
                        </div>
                    </>}

                    {signSuccess && (
                        <div style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'green',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '5px',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
                            zIndex: '9999'
                        }}>
                            <span role="img" aria-label="green check mark">✅</span> Document Signed Successfully
                        </div>
                    )}
                    
                </div>
            )}
        </div>
        
    </Container>
}

export default SignDocument;