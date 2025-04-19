export const mockStaticAssets = {
  images: {
    logo: '/images/logo.png',
    placeholder: '/images/placeholder.jpg',
    documentTypes: {
      invoice: '/images/document-types/invoice.svg',
      receipt: '/images/document-types/receipt.svg',
      contract: '/images/document-types/contract.svg',
      report: '/images/document-types/report.svg',
    },
  },
  documents: {
    sampleInvoice: '/documents/sample-invoice.pdf',
    sampleReceipt: '/documents/sample-receipt.pdf',
    sampleContract: '/documents/sample-contract.pdf',
  },
  icons: {
    upload: '/icons/upload.svg',
    download: '/icons/download.svg',
    delete: '/icons/delete.svg',
    edit: '/icons/edit.svg',
    view: '/icons/view.svg',
    settings: '/icons/settings.svg',
  },
};

export const getAssetPath = (path: string): string => {
  // Simulate base URL concatenation
  const baseUrl = '/assets';
  return `${baseUrl}${path}`;
};

export const isValidAssetPath = (path: string): boolean => {
  // Simple validation to check if the path exists in our mock structure
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
      const value = obj[key];
      if (typeof value === 'object') {
        Object.assign(acc, flattenObject(value, `${prefix}${key}.`));
      } else {
        acc[`${prefix}${key}`] = value;
      }
      return acc;
    }, {});
  };

  const allPaths = Object.values(flattenObject(mockStaticAssets));
  return allPaths.includes(path);
};

export const getAssetType = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];
  const documentExtensions = ['pdf', 'doc', 'docx'];

  if (imageExtensions.includes(extension)) return 'image';
  if (documentExtensions.includes(extension)) return 'document';
  return 'unknown';
};