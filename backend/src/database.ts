import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://elasticsearch:9200'
});

const checkElasticsearchConnection = async () => {
  try {
    await client.ping();
    console.log('Elasticsearch cluster is up!');
  } catch (error) {
    console.error('Elasticsearch cluster is down!', error);
  }
};

checkElasticsearchConnection();

export { client };
