import { FakeJournal } from "./fakeJournal";
import { describeJournalContract } from "./journalContract";

describeJournalContract("FakeJournal", () => new FakeJournal());
