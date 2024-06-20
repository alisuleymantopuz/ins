import axios from 'axios';
import express, { Request, Response } from 'express';
import { client } from './database';

const emailRouter = express.Router();

const fetchEmails = async (accessToken: string, userId: string, nextLink: string | null = null): Promise<any[]> => {
  const url = nextLink || 'https://graph.microsoft.com/v1.0/me/mailfolders/inbox/messages';
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const emails = response.data.value;

  if (response.data['@odata.nextLink']) {
    const nextBatch = await fetchEmails(accessToken, userId, response.data['@odata.nextLink']);
    return emails.concat(nextBatch);
  } else {
    return emails;
  }
};

emailRouter.post('/sync', async (req: Request, res: Response) => {
  const { accessToken, userId } = req.body;

  try {
    const emails = await fetchEmails(accessToken, userId);

    const bulkOps = emails.flatMap((email: { id: any; }) => [
      { index: { _index: 'emails', _id: email.id } },
      { userId, ...email }
    ]);

    await client.bulk({
      refresh: true,
      body: bulkOps
    });
    res.json({ message: 'Emails synchronized' });
  } catch (error) {
    console.error('Error during sync:', error); // Log the error
    res.status(500).json({ error: 'An error occurred during sync' });
  }
});

interface Email {
  id: string;
  [key: string]: any;
}

emailRouter.get('/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const result = await client.search({
      index: 'emails',
      body: {
        query: {
          match: { userId }
        }
      }
    });

    const hits = result.body.hits.hits.map((hit: any) => hit._source);
    res.json(hits);
  } catch (error) {
    console.error('Error fetching emails:', error); // Log the error
    res.status(500).json({ error: 'An error occurred while fetching emails' });
  }
});

export { emailRouter };
