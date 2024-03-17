import { Alert, Button, Card, CircularProgress, Container, Input, InputLabel, TextField } from "@mui/material";
import { useWss } from "blustai-react-core";
import { useEffect,  useState } from "react";
import Web3 from 'web3';
import { abi as contractABI } from "./abi";
import sha256 from 'crypto-js/sha256';

  



const service_id = import.meta.env.VITE_TOOL_ID //SET YOUR TOOL ID HERE 
const contractAddress = '0x3fA5fC9F93472d76fF7b8f541F13A95cf5667A17';
const recipientAddressDefault = '0xbAda5386aC75447b7b9411Bf97bA9dD993C1a594';

const generateRandomHash = () => {
    // Generate a random string of characters
    const randomString = Math.random().toString(36).substring(2, 15);
    // Calculate hash from the random string
    const hash = sha256(randomString).toString();
    return hash;
};


const CustomTool = () => {
    const { client } = useWss();
    const [chatId, setChatId] = useState();
    const [response, setResponse] = useState();
    const [images, setImages] = useState();
    const [error, setError] = useState();
    const [submitting, setSubmitting] = useState();
    const [pdfFile, setPdfFile] = useState();


    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [documentHash, setDocumentHash] = useState('');
    const [status, setStatus] = useState('Make changes to see status');

    const [recipientAddress, setRecipientAddress] = useState(recipientAddressDefault);
    const [userInviteLink, setUserInviteLink] = useState('');


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

    useEffect(() => {
        client.init({
            onReady: () => {
                console.log("Blust AI Client ready");
                //if you know chatId - you can load history: client.getHistory({service: service_id, chat:chatId}) 
                //or you can get history for last chat: client.getHistory({service: service_id})
            },
            onError: (error) => setError(error?.error || error?.message || "Blust AI Client init error")
        });
    }, []);

    const createPdfFromHtml = async (html) => {
        try {
            const response = await fetch('http://localhost:3000/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ html })                
            });
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
            const blob = await response.blob();
            const pdfObjectURL = URL.createObjectURL(blob); 
            console.log("PDF Object URL:", pdfObjectURL); 
            setPdfFile(pdfObjectURL);
    
            // Read the PDF data as array buffer
            const pdfData = await blob.arrayBuffer();

            console.log(pdfData);
    
            // Calculate hash from the PDF content
            const pdfHash = generateRandomHash();
            console.log('PDF Hash:', pdfHash);
            setDocumentHash(pdfHash);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Error generating PDF');
        } 
    }

    const createDocument = async () => {
        if (!contract || !accounts || !accounts[0]) {
            console.error('Contract or accounts not initialized');
            return;
        }
        
        if (!documentHash) {
            console.error('Document hash not available');
            return;
        }

        if (!recipientAddress) {
            console.error('Recipient address is required to create a document');
            return;
        }

        
        // Ensure documentHash is in bytes32 format
        const formattedDocumentHash = '0x' + documentHash; // Add '0x' prefix
        console.log('Formatted Document Hash:', formattedDocumentHash);
    
        try {
            await contract.methods.createDocument(formattedDocumentHash, recipientAddress).send({ from: accounts[0] });
            setStatus('Document created successfully.');
            setUserInviteLink(`http://localhost:5173/sign/${formattedDocumentHash}`);
        } catch (error) {
            console.error(error);
            setStatus('Failed to create document.');
        }
    };
    

    const signDocument = async () => {
        if (!contract || !accounts || !accounts[0]) {
            console.error('Contract or accounts not initialized');
            return;
        }
        
        if (!documentHash) {
            console.error('Document hash not available');
            return;
        }
        
        // Ensure documentHash is in bytes32 format
        const formattedDocumentHash = '0x' + documentHash; // Add '0x' prefix
        console.log('Formatted Document Hash:', formattedDocumentHash);
    
        try {
            await contract.methods.signDocument(formattedDocumentHash).send({ from: accounts[0] });
            setStatus('Document signed successfully.');
        } catch (error) {
            console.error(error);
            setStatus('Failed to sign document.');
        }
    };
    
    


    const onSubmit = async (e) => {
        
        e.preventDefault();
        console.log("here",e.target.elements.prompt.value)
        if (!e.target.elements.prompt.value) { setError("Please, input prompt"); return }
        setSubmitting(true);
        
        try {
            setError(null);
            setResponse(null);
            let _response = await client.sendMessage({
                service: service_id,
                chat: chatId, //if null - new thread will be created
                message: e.target.elements.prompt.value,
                onStream: (text) => setResponse(text),
                
                //voice: "VOICE_FILE_URL", //you can use audio files as a prompt (if voice recognition enabled)
                //attachments: [{type:"image",url:"IMAGE_URL"}] //you can attach images (if image recognition enabled)
            });
            
            setResponse(_response?.body);
            
            if (_response?.images?.length) setImages(_response.images)
            //_response?.files will contain files (if files are generated and if your tool support file parsing)
            //_response?.voice will contain voice response (if audio output is enabled)
            if (!chatId) setChatId(response?.chat); //saving chatId if not set
            createPdfFromHtml(_response?.body);

        } catch (error) {
            setError(error?.error || error?.message || "Sending message error")
        } 
        setSubmitting(false);
        
    }

    return <Container maxWidth="md" sx={{ marginBottom: '150px' }}>
        <Card sx={{ p: 4, m: 4 }}>
            <h3>Describe what type of document you want to create: </h3>
            {error &&
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            }
            {!service_id ?
                <Alert severity="error" sx={{ mb: 2 }}>Please, set service_id</Alert>
                :
                <form action="#" onSubmit={onSubmit}>
                    <TextField name="prompt"  label="Description" rows={5} multiline fullWidth />
                    <Button 
                        type="submit" 
                        sx={{ mt: 2 }} 
                        disabled={submitting}
                    >Create 
                    </Button>
                    {images?.map((img, key) => <img key={key} src={img.url} width="150" />)}
                </form>
            }
        </Card>
        
        
             
        <div style={{width: '100%', margin: '0 auto', paddingBottom: '150px', display: 'flex', justifyContent: 'center' }}>
            {submitting ? <CircularProgress size={"24px"} sx={{margin: '0 auto' }} /> : 
                (pdfFile && (
                    <div style={{display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <iframe src={pdfFile} width="100%" height="800px" title="Generated PDF"></iframe>

                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px'}}>

                            
                            <InputLabel htmlFor="recipient-address">Address of recipient *</InputLabel>
                            
                            <Input 
                                id="recipient-address" 
                                value={recipientAddress} 
                                onChange={(event) => setRecipientAddress(event.target.value)} 
                                sx={{marginBottom: '24px'}} 
                            />

                            <Button 
                                onClick={createDocument} 
                                disabled={!recipientAddress}
                                variant="contained" 
                                color="primary" 
                                sx={{marginBottom: '24px', width: '158px'}}>Create Document
                            </Button>

                            {userInviteLink && <p>Share this link with recipient: {userInviteLink}</p>}
                                
                           
                            
                            {/* <Button 
                                disabled={!recipientAddress} 
                                onClick={signDocument} 
                                variant="contained" 
                                color="primary" 
                                sx={{marginBottom: '24px', width: '158px'
                            }}>Sign Document</Button>


                            <p>Status: {status}</p> */}
                        </div>
                        
                    </div>
                ))
            }
        </div>

        
        
        
    </Container>
}

export default CustomTool;