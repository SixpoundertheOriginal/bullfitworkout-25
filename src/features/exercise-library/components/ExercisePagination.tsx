
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ExercisePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ExercisePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ExercisePaginationProps) {
  // Handle page changes
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => paginate(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {/* First page */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis */}
        {currentPage > 3 && (
          <PaginationItem>
            <span className="px-2">...</span>
          </PaginationItem>
        )}
        
        {/* Previous page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => paginate(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Current page */}
        <PaginationItem>
          <PaginationLink isActive>{currentPage}</PaginationLink>
        </PaginationItem>
        
        {/* Next page */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => paginate(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <span className="px-2">...</span>
          </PaginationItem>
        )}
        
        {/* Last page */}
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => paginate(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => paginate(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
