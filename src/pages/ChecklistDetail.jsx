import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Check, X } from "lucide-react";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  TextField,
  Box,
} from "@mui/material";
import {
  fetchChecklistItems,
  createChecklistItem,
  updateChecklistItemStatus,
  updateChecklistItemName,
  deleteChecklistItem,
} from "../store/features/checklistItemSlice";
import { fetchChecklists } from "../store/features/checklistSlice";

export default function ChecklistDetail() {
  const { id: checklistId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State untuk data checklist
  const checklistsState = useSelector((state) => state.checklists);
  const checklist = checklistsState.items.find(
    (c) => c.id === parseInt(checklistId)
  );

  // State untuk items dari checklist ini
  const checklistItemsState = useSelector((state) => state.checklistItems);
  const items = checklistItemsState.itemsByChecklistId[checklistId] || [];
  const isLoading = checklistItemsState.loadingItems[checklistId] || false;
  const isCreating = checklistItemsState.status === "loading";

  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");

  // Load data saat komponen dimount atau checklistId berubah
  useEffect(() => {
    if (checklistId) {
      // Jika checklist tidak ditemukan, coba muat ulang daftar checklist
      if (!checklist) {
        dispatch(fetchChecklists());
      }

      // Muat items untuk checklist ini
      dispatch(fetchChecklistItems(checklistId));
    }
  }, [dispatch, checklistId, checklist]);

  const handleCreateItem = () => {
    if (newItemName.trim()) {
      dispatch(
        createChecklistItem({
          checklistId,
          data: { itemName: newItemName },
        })
      ).then(() => {
        setNewItemName("");
      });
    }
  };

  const handleStatusChange = (itemId, currentStatus) => {
    dispatch(
      updateChecklistItemStatus({
        checklistId,
        itemId,
        status: !currentStatus,
      })
    );
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditName(item.name);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditName("");
  };

  const saveEdit = () => {
    if (editName.trim() && editingItem) {
      dispatch(
        updateChecklistItemName({
          checklistId,
          itemId: editingItem,
          data: { itemName: editName },
        })
      );
      setEditingItem(null);
      setEditName("");
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Delete this item?")) {
      dispatch(
        deleteChecklistItem({
          checklistId,
          itemId,
        })
      );
    }
  };

  if (!checklist) {
    // Tampilkan loading jika checklist belum dimuat
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <span className="ml-4">Loading checklist...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{checklist.name}</h2>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>

      <Box className="mb-6 flex items-center justify-between">
        <TextField
          variant="outlined"
          label="New item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreateItem()}
          disabled={isCreating}
        />
        <Button
          variant="contained"
          className="ml-2"
          onClick={handleCreateItem}
          disabled={!newItemName.trim() || isCreating}
          startIcon={<Plus />}
        >
          {isCreating ? "Adding..." : "Add"}
        </Button>
      </Box>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <CircularProgress />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No items in this checklist
        </div>
      ) : (
        <List className="bg-slate-300 rounded-lg shadow-xl">
          {items.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 size={18} className="text-red-500" />
                </IconButton>
              }
            >
              <Checkbox
                checked={item.status || false}
                onChange={() => handleStatusChange(item.id, item.status)}
                icon={
                  <span className="border border-gray-400 rounded w-5 h-5" />
                }
                checkedIcon={
                  <Check className="bg-blue-500 text-white rounded w-5 h-5" />
                }
              />

              {editingItem === item.id ? (
                <div className="flex items-center flex-grow">
                  <TextField
                    fullWidth
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                  />
                  <IconButton onClick={saveEdit} className="ml-2">
                    <Check size={18} />
                  </IconButton>
                  <IconButton onClick={cancelEditing} className="ml-1">
                    <X size={18} />
                  </IconButton>
                </div>
              ) : (
                <ListItemText
                  primary={item.name}
                  className={item.status ? "line-through text-gray-500" : ""}
                  onClick={() => startEditing(item)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
