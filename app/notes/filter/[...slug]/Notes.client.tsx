"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes, type FetchNotesResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import { Pagination } from "@/components/Pagination/Pagination";
import { Modal } from "@/components/Modal/Modal";
import { NoteForm } from "@/components/NoteForm/NoteForm";
import SearchBox from "@/components/SearchBox/SearchBox";
import Loading from "../../../loading";
import css from "./NotesPage.module.css";

export default function NotesClient({ tag }: { tag: string | undefined }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSetSearchQuery = useDebouncedCallback((value: string) => {
    setPage(1);
    setSearchQuery(value.trim());
  }, 500);

  const { data, isLoading, isError } = useQuery<FetchNotesResponse, Error>({
    queryKey: ["notes", searchQuery, page, tag],
    queryFn: () => fetchNotes({ search: searchQuery || undefined, page, perPage: 12, tag }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && data.notes.length === 0) {
      toast("No notes found for your query.");
    }
  }, [data]);

  return (
    <div className={css.container}>
      <header className={css.toolbar}>
        <Toaster position="top-right" reverseOrder={false} />

        <SearchBox value={searchQuery} onSearch={debouncedSetSearchQuery} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button className={css.createButton} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <Loading />}
      {isError && <p>Error loading notes.</p>}

      {data && <NoteList notes={data.notes} />}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onCancel={() => setIsModalOpen(false)} onCreated={() => setPage(1)} />
        </Modal>
      )}
    </div>
  );
}
