import { Search, Download, Heart, Users, Shield, Globe, BookOpen, MessageCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";

const Features = () => {
const features = [
    {
      icon: BookOpen,
      title: "مستند مواد",
      description: "قابل اعتماد علماء اور اداروں سے احتیاط سے منتخب کردہ اسلامی کتب، خطبات اور وسائل",
    },
    {
      icon: Search,
      title: "ذہین تلاش",
      description: "طاقتور تلاش اور فلٹرنگ کے اختیارات کے ساتھ وہی تلاش کریں جس کی آپ کو ضرورت ہے",
    },
    {
      icon: Heart,
      title: "ذاتی کتب خانہ",
      description: "اپنے سیکھنے کے سفر کو منظم کرنے کے لیے پسندیدہ کو محفوظ کریں اور مرضی کی فہرستیں بنائیں",
    },
    {
      icon: Users,
      title: "کمیونٹی پر مبنی",
      description: "دنیا بھر کے علماء اور معاونین مستند اسلامی علم شیئر کرتے ہیں",
    },
    {
      icon: Shield,
      title: "معیار کی ضمانت",
      description: "انتظامی ٹیم کے ذریعہ مواد کا فوری جائزہ لیا جاتا ہے اور شائع کیا جاتا ہے",
    },
    {
      icon: Globe,
      title: "کثیر لسانی",
      description: "عربی، اردو اور بہت سی زبانوں میں دستیاب مواد",
    },
    {
      icon: Download,
      title: "بغیر انٹرنیٹ رسائی",
      description: "کسی بھی وقت، کہیں بھی بغیر انٹرنیٹ پڑھنے اور سننے کے لیے مواد حاصل کریں",
    },
    {
      icon: MessageCircle,
      title: "سوال و جواب",
      description: "سوالات پوچھیں اور باخبر کمیونٹی ممبران سے جوابات حاصل کریں",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration with premium feel */}
      <div className="absolute inset-0 islamic-pattern opacity-[0.03]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-medium mb-4"
          >
            {"پلیٹ فارم کی خصوصیات"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            {"آپ کی روحانی ترقی کے لیے سب کچھ"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {"ایک جامع پلیٹ فارم جو پوری دنیا کے مسلمانوں کے لیے مستند اسلامی علم تک رسائی کو آسان بناتا ہے"}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group p-8 rounded-2xl glass-dark hover-lift border border-border/50 hover:border-primary/40 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
