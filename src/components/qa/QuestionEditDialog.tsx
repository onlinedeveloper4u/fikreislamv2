import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface QuestionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  currentQuestion: string;
  onQuestionUpdated: () => void;
}

export function QuestionEditDialog({
  open,
  onOpenChange,
  questionId,
  currentQuestion,
  onQuestionUpdated,
}: QuestionEditDialogProps) {
  const { toast } = useToast();
  const [question, setQuestion] = useState(currentQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .update({ question: question.trim() })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "سوال تبدیل ہو گیا",
        description: "سوال کامیابی سے تبدیل ہو گیا ہے",
      });
      onQuestionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "غلطی",
        description: "سوال تبدیل کرنے میں ناکامی",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>سوال میں ترمیم کریں</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
            placeholder="اپنا سوال یہاں درج کریں..."
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              منسوخ
            </Button>
            <Button type="submit" disabled={isSubmitting || !question.trim()}>
              {isSubmitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}