import * as Yup from "yup";
import css from "./NoteForm.module.css";
import type { NoteTag } from "@/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import { useRouter } from "next/router";
import {  useNoteDraftStore } from "@/lib/store/noteStore";

export interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters")
    .required("Title is required"),
  content: Yup.string()
    .max(500, "Content must be at most 500 characters"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

interface NoteFormProps {
  onCancel: () => void;
  onCreated: () => void;
}

export default function NoteForm: React.FC<NoteFormProps> = ({ onCancel, onCreated }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { draft, setDraft, clearDraft } = useDraft();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  };
  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      clearDraft();
      router.push('/notes/filter/all');
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onCreated();
      onCancel();
    },
  });

  const handleSubmit = (formData: FormData) => { 
    const values = Object.fromEntries(formData.entries()) as NoteFormValues;
    mutation.mutate(values);
  }

  const initialValues: NoteFormValues = { title: "", content: "", tag: "Todo" };

  return (
    <form className={css.form} action={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <Field id="title" type="text" name="title" className={css.input} defaultValue={draft?.title} onChange={handleChange} />
        <ErrorMessage name="title" component="span" className={css.error} />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <Field
          as="textarea"
              id="content"
              name="content"
              rows={8}
          className={css.textarea}
          defaultValue={draft?.content}
          onChange={handleChange}
        />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error} />
      </div>

      <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field
              as="select"
              id="tag"
              name="tag"
              className={css.select}
              defaultValue={draft?.tag}
              onChange={handleChange}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage
              name="tag"
              component="span"
              className={css.error}
            />
      </div>

      <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting || mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create note"}
            </button>
      </div>
    </form>
  )
}
