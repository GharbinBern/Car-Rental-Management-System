

### 4. 🧠 **Constraints & Triggers**

CREATE OR REPLACE FUNCTION calc_late_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.actual_return_datetime > NEW.return_datetime THEN
        NEW.late_duration := NEW.actual_return_datetime - NEW.return_datetime;
    ELSE
        NEW.late_duration := INTERVAL '0';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_late_duration
BEFORE INSERT OR UPDATE ON Rental
FOR EACH ROW
EXECUTE FUNCTION calc_late_duration();

