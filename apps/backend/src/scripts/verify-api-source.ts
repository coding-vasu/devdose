import axios from 'axios';

async function verifyApiSource() {
  console.log('🔍 Verifying API Source Data...');
  try {
    const response = await axios.get('http://localhost:3000/api/posts?limit=5');
    const posts = response.data.data;
    
    if (posts && posts.length > 0) {
      console.log(`✅ ${posts.length} posts found.\n`);
      
      posts.forEach((post: any, index: number) => {
        console.log(`Post ${index + 1}: ${post.title}`);
        console.log(`📁 Category: ${post.category}`);
        console.log(`🏷️ Tags: ${post.tags.join(', ')}`);
        console.log('-'.repeat(30));
      });
      
      const allHaveCategory = posts.every((p: any) => p.category);
      if (allHaveCategory) {
        console.log('\n🎉 SUCCESS: All posts have the category field!');
      } else {
        console.log('\n⚠️ SOME POSTS ARE MISSING CATEGORIES.');
      }
    } else {
      console.log('⚠️ No posts found in the database. Please run the pipeline or add test data.');
    }
  } catch (error: any) {
    console.error('❌ Error calling API:', error.message);
    console.log('   Make sure the API server is running (npm run api)');
  }
}

verifyApiSource();
