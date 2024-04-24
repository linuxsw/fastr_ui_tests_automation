import { Page } from '@playwright/test';

export async function getCellValue(page: Page, rowIndex: number, columnName: string): Promise<string | null> {
    // Find the column index by the column name
    const columns = await page.$$eval('.k-grid-header th', (ths) =>
        ths.map((th) => th.textContent?.trim())
    );
    const columnIndex = columns.indexOf(columnName) + 1; // +1 because columns are 1-indexed in selectors

    if (columnIndex < 1) {
        console.error(`Column "${columnName}" not found.`);
        return null;
    }

    // Construct the selector based on the row index and column index
    const cellSelector = `.k-grid-content tr:nth-child(${rowIndex}) > td:nth-child(${columnIndex})`;

    // Retrieve and return the cell value
    const cellValue = await page.textContent(cellSelector);
    return cellValue?.trim() || null;
}

export async function getTBodyContent(page: Page): Promise<string> {
    // Retrieve the outer HTML of the tbody element
    const tbodyHTML = await page.$eval('tbody', (tbody) => tbody.outerHTML);
    return tbodyHTML;
}