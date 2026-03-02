import Layout from "@/components/layout/Layout";
import { ContentBrowser } from "@/components/content/ContentBrowser";

const Audio = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ContentBrowser
          contentType="audio"
          title="آڈیو لائبریری"
          description="مختلف علماء کے بصیرت افروز خطبات، سلسلے اور قرآنی تلاوت سنیں۔"
        />
      </div>
    </Layout>
  );
};

export default Audio;
