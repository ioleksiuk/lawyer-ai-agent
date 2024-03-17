import { useEffect, useState } from 'react';

const useSignDocumentId = () => {
  const [documentId, setDocumentId] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    const regex = /^\/sign\/([^/]+)$/;
    const match = path.match(regex);
    if (match && match[1]) {
      setDocumentId(match[1]);
    }
  }, []);

  return documentId;
};

export default useSignDocumentId;
