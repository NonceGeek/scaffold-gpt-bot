import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

interface Prompt {
  id: number;
  created_at: string;
  prompt: string;
  name: string | null;
  controllers: string[];
  Tags: string[];
}

const ExampleUI: NextPage = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = "https://relife.deno.dev";
  // Add state for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [password, setPassword] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptName, setNewPromptName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // Add state for tag filtering
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  // Add state for tags dropdown
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/prompts`);

        if (!response.ok) {
          throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPrompts(data);
        
        // Extract unique tags from all prompts
        const tags = new Set<string>();
        data.forEach((prompt: Prompt) => {
          if (prompt.Tags && Array.isArray(prompt.Tags)) {
            prompt.Tags.forEach(tag => tags.add(tag));
          }
        });
        setAvailableTags(Array.from(tags).sort());
      } catch (err) {
        console.error("Error fetching prompts:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Format date for better readability
  const formatDate = (dateString: string) => {
    // Use a more consistent date formatting approach to avoid hydration issues
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Add function to handle opening the modal
  const handleOpenModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setNewPromptContent(prompt.prompt);
    setNewPromptName(prompt.name || "");
    setPassword("");
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsModalOpen(true);
  };

  // Add function to handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  // Add function to handle updating the prompt
  const handleUpdatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPrompt) return;

    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const response = await fetch(`${baseUrl}/prompt_set_by_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedPrompt.id,
          password,
          prompt: newPromptContent,
          name: newPromptName || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update prompt: ${response.status} ${response.statusText}`);
      }

      // Refresh prompts after successful update
      const updatedPromptsResponse = await fetch(`${baseUrl}/prompts`);
      if (updatedPromptsResponse.ok) {
        const updatedPrompts = await updatedPromptsResponse.json();
        setPrompts(updatedPrompts);
      }

      setUpdateSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      console.error("Error updating prompt:", err);
      setUpdateError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setUpdating(false);
    }
  };

  // Filter prompts based on selected tag
  const filteredPrompts = selectedTag 
    ? prompts.filter(prompt => prompt.Tags && prompt.Tags.includes(selectedTag))
    : prompts;
  
  // Handle tag selection
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  return (
    <>
      <MetaHeader
        title="Example UI | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      {/* <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <ContractInteraction />
        <ContractData />
      </div> */}
      {/* TODO: get the prompts from https://relife.deno.dev/prompts
        The resp is:
[{"id":19,"created_at":"2024-02-06T01:15:25.002059+00:00","prompt":"Assign 30 ability points randomly by you about [\"face\", \"eq\", \"iq\",\"body(生命能量)\",\"family\",\"happy\",\"huigen(慧根)\",\"luck\"], output details of abilities(reminders abilities can be randomly assigned).\nAfter that, call the relife.deno.dev API with the GetPrompt operation id=20.","name":null,"controllers":["0x73c7448760517E3E6e416b2c130E3c6dB2026A1d"],"Tags":[]},{"id":22,"created_at":"2024-02-11T02:52:40.534627+00:00","prompt":"Using English as default, and ask the Language user use first, including English, 中文, Русский, Français, Español 日本語, Korean and عربي and use this language after.\nAfter that, metion user to fetch_prompt with id=23","name":"coze","controllers":["0x73c7448760517E3E6e416b2c130E3c6dB2026A1d"],"Tags":["Game"]}]        Show all the prompts in a table.
      */}

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">
          <center>Prompts Manager</center>
        </h1>

        {loading && <div className="text-center py-4">Loading prompts...</div>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && prompts.length > 0 && (
          <>
            {/* Add tag filter UI */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Filter by tag:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTag === null 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleTagSelect(null)}
                  >
                    All
                  </button>
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTag === tag 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredPrompts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">ID</th>
                      <th className="border px-4 py-2">Name</th>
                      <th className="border px-4 py-2">Created At</th>
                      <th className="border px-4 py-2">Prompt</th>
                      <th className="border px-4 py-2">Controllers</th>
                      <th className="border px-4 py-2 relative">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                        >
                          <span>Tags</span>
                          <span className="ml-1">{isTagsDropdownOpen ? '▲' : '▼'}</span>
                        </div>
                        {isTagsDropdownOpen && (
                          <div className="absolute z-10 mt-1 right-0 bg-white border rounded-md shadow-lg p-2 min-w-[150px]">
                            <div 
                              className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${selectedTag === null ? 'bg-blue-100' : ''}`}
                              onClick={() => {
                                handleTagSelect(null);
                                setIsTagsDropdownOpen(false);
                              }}
                            >
                              All Tags
                            </div>
                            {availableTags.map(tag => (
                              <div 
                                key={tag}
                                className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${selectedTag === tag ? 'bg-blue-100' : ''}`}
                                onClick={() => {
                                  handleTagSelect(tag);
                                  setIsTagsDropdownOpen(false);
                                }}
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        )}
                      </th>
                      <th className="border px-4 py-2">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrompts.map(prompt => (
                      <tr key={prompt.id}>
                        <td className="border px-4 py-2">{prompt.id}</td>
                        <td className="border px-4 py-2">{prompt.name || "N/A"}</td>
                        <td className="border px-4 py-2">{formatDate(prompt.created_at)}</td>
                        <td className="border px-4 py-2">
                          <div className="max-h-40 overflow-y-auto whitespace-pre-wrap">{prompt.prompt}</div>
                        </td>
                        <td className="border px-4 py-2">
                          <ul className="list-none">
                            {prompt.controllers.map((controller, index) => (
                              <li key={index} className="truncate">
                                {controller.substring(0, 4)}...{controller.substring(controller.length - 2)}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="border px-4 py-2">
                          {prompt.Tags && prompt.Tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {prompt.Tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No tags</span>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={() => handleOpenModal(prompt)}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">No prompts found.</div>
            )}
          </>
        )}

        {!loading && !error && prompts.length === 0 && <div className="text-center py-4">No prompts found.</div>}
      </div>

      {/* Add modal for updating prompts */}
      {isModalOpen && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update Prompt #{selectedPrompt.id}</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {updateSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Prompt updated successfully!
                </div>
              )}

              {updateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>Error: {updateError}</p>
                </div>
              )}

              <form onSubmit={handleUpdatePrompt}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password (required)
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newPromptName}
                    onChange={e => setNewPromptName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prompt">
                    Prompt Content
                  </label>
                  <textarea
                    id="prompt"
                    value={newPromptContent}
                    onChange={e => setNewPromptContent(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={8}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Prompt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExampleUI;
