export async function generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    // In a real implementation this would query the DB
    // We will update this later when DB is connected
    const count = Math.floor(Math.random() * 1000) + 1;
    return `ASTU-${year}-${String(count).padStart(5, '0')}`;
}
