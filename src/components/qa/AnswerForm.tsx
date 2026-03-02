import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface AnswerFormProps {
  questionId: string;
  onAnswerAdded: () => void;
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = role === 'admin';
  const canAnswer = isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('answers').insert({
        question_id: questionId,
        answered_by: user.id,
        answer: answer.trim(),
        status: isAdmin ? 'approved' : 'pending',
        approved_at: isAdmin ? new Date().toISOString() : null,
      });

      if (error) throw error;

      toast({
        title: isAdmin ? "جواب شائع ہو گیا" : "جواب جمع کر دیا گیا",
        description: isAdmin
          ? "آپ کا جواب جمع کر دیا گیا ہے!"
          : "آپ کا جواب جائزے کے لیے جمع کر دیا گیا ہے",
      });
      setAnswer('');
      onAnswerAdded();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "غلطی",
        description: "جواب جمع کرانے میں ناکامی",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAnswer) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-3">
      <Textarea
        placeholder="اپنا جواب یہاں فراہم کریں..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="min-h-[60px] text-sm"
      />
      <Button type="submit" size="sm" disabled={isSubmitting || !answer.trim()}>
        <Send className="h-3 w-3 mr-1" />
        {isSubmitting ? "جمع ہو رہا ہے..." : "جواب جمع کرائیں"}
      </Button>
    </form>
  );
}
