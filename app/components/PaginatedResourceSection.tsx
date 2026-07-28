import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink className="pagination-btn pagination-btn-prev">
              {isLoading ? (
                'STOCKING…'
              ) : (
                <>
                  <span aria-hidden="true">↑</span> LOAD PREVIOUS
                </>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className="pagination-btn">
              {isLoading ? (
                'STOCKING MORE SHELVES…'
              ) : (
                <>
                  LOAD MORE UNITS <span aria-hidden="true">↓</span>
                </>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
