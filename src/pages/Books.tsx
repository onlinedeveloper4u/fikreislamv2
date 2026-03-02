import Layout from "@/components/layout/Layout";
import { ContentBrowser } from "@/components/content/ContentBrowser";

const Books = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ContentBrowser
          contentType="book"
          title="اسلامی کتب"
          description="مستند اسلامی کتب اور علمی متون کا ہمارا مجموعہ دیکھیں۔"
        />
      </div>
    </Layout>
  );
};

export default Books;
