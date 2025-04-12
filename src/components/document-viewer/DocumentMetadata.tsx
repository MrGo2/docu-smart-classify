
import React from "react";
import { ExtractionStrategy } from "@/lib/extraction/types";

interface DocumentMetadataProps {
  filename: string;
  fileType: string;
  classification: string | null;
  extractionStrategy: string | null | undefined;
  metadata: Record<string, any> | null | undefined;
}

const DocumentMetadata: React.FC<DocumentMetadataProps> = ({
  filename,
  fileType,
  classification,
  extractionStrategy,
  metadata,
}) => {
  // Format extraction strategy for display
  const getExtractionStrategyDisplay = (strategy: string | null | undefined): string => {
    if (!strategy) return "Full Text (Default)";
    
    switch (strategy) {
      case ExtractionStrategy.FIRST_PAGE:
        return "First Page Only";
      case ExtractionStrategy.FIRST_LAST:
        return "First & Last Pages";
      case ExtractionStrategy.FIRST_MIDDLE_LAST:
        return "First, Middle & Last Pages";
      case ExtractionStrategy.ALL:
        return "All Document Text";
      default:
        return strategy;
    }
  };

  // Render metadata information
  const renderMetadata = () => {
    if (!metadata) return <p>No metadata available</p>;
    
    return (
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-500 capitalize">{key}</span>
            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Filename</p>
          <p>{filename}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">File Type</p>
          <p>{fileType}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Classification</p>
          <p>{classification || "Unclassified"}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Extraction Strategy</p>
          <p>{getExtractionStrategyDisplay(extractionStrategy)}</p>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2">File Metadata</h3>
        {renderMetadata()}
      </div>
    </div>
  );
};

export default DocumentMetadata;
